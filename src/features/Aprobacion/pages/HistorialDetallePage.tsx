import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, User, Car, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';
import { axiosClient } from '../../../shared/api/axiosClient';
import { solicitudApi, RecursoDisponible } from '../api/solicitudApi';
import { toast } from 'sonner';

export default function HistorialDetallePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reasignación
  const [showReasignarModal, setShowReasignarModal] = useState(false);
  const [recursos, setRecursos] = useState<RecursoDisponible | null>(null);
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState<number | ''>('');
  const [selectedMotorista, setSelectedMotorista] = useState<number | ''>('');
  const [motivoReasignacion, setMotivoReasignacion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let showData = null;
        let compData = null;

        const isCombustible = id?.startsWith('CB-');
        const endpoint = isCombustible ? `/solicitudes-combustible/${id}` : `/solicitudes-transporte/${id}`;

        // 1. Obtener los datos reales finales (estado, asignación real)
        try {
          const showRes = await axiosClient.get(endpoint);
          showData = showRes.data.data || showRes.data;
        } catch (e) {
          console.error('Error fetching show data', e);
        }

        // 2. Obtener la comparativa (para datos de sugerencias si aplica)
        try {
          const compRes = await axiosClient.get(`${endpoint}/comparativa`);
          compData = compRes.data;
        } catch (e) {
          console.error('Error fetching comparativa data', e);
        }

        if (!showData && !compData) {
          setError('No se pudo cargar el detalle de la solicitud.');
          return;
        }

        setData({ raw: showData, comparativa: compData });
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error inesperado al cargar.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const openReasignarModal = async () => {
    setShowReasignarModal(true);
    setLoadingRecursos(true);
    try {
      const rawData = data.raw || {};
      const compData = data.comparativa?.solicitud || {};
      const fechaS = rawData.fecha_salida || compData.fechas?.salida;
      const fechaR = rawData.fecha_retorno || compData.fechas?.retorno;
      
      const result = await solicitudApi.getRecursosDisponibles(fechaS, fechaR);
      setRecursos(result);
    } catch (_err) {
      // Fallback: intentar catálogos directos
      try {
        const [vRes, mRes] = await Promise.all([
          axiosClient.get('/catalogos/vehiculos/disponibles'),
          axiosClient.get('/catalogos/motoristas/disponibles')
        ]);
        setRecursos({
          vehiculos: Array.isArray(vRes.data) ? vRes.data : [],
          motoristas: Array.isArray(mRes.data) ? mRes.data : []
        });
      } catch (_err2) {
        setRecursos({ vehiculos: [], motoristas: [] });
      }
    } finally {
      setLoadingRecursos(false);
    }
  };

  const handleReasignar = async () => {
    if (!id || !selectedVehiculo || !selectedMotorista || !motivoReasignacion.trim()) return;
    try {
      setIsSubmitting(true);
      await solicitudApi.reasignar(id, Number(selectedVehiculo), Number(selectedMotorista), motivoReasignacion);
      toast.success('¡Reasignación exitosa! El motorista y vehículo han sido actualizados.');
      setShowReasignarModal(false);
      // Recargar datos
      const [showRes, compRes] = await Promise.all([
        axiosClient.get(`/solicitudes-transporte/${id}`),
        axiosClient.get(`/solicitudes-transporte/${id}/comparativa`)
      ]);
      setData({ 
        raw: showRes.data.data || showRes.data, 
        comparativa: compRes.data 
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al reasignar recursos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#859BFF]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-red-500 mb-4 font-medium">{error || 'Solicitud no encontrada'}</p>
        <Link to="/historial" className="text-[#859BFF] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al Historial
        </Link>
      </div>
    );
  }

  const raw = data.raw || {};
  const comp = data.comparativa?.solicitud || {};
  
  // Preferimos raw porque es la fuente de la verdad para solicitudes ya aprobadas
  const statusRaw = raw.estado || raw.status || comp.status || comp.estado || '';
  const status = typeof statusRaw === 'string' ? statusRaw.toLowerCase() : (statusRaw.value || '').toLowerCase();
  
  const isAprobada = status.includes('aprobada') || status.includes('programada');
  const isRechazada = status.includes('rechazada');

  const getStatusColor = () => {
    if (isAprobada) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Aprobada' };
    if (isRechazada) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Rechazada' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', label: status || 'Desconocido' };
  };

  const statusInfo = getStatusColor();
  const fechaSalidaVal = raw.fecha_salida || comp.fechas?.salida;
  const fechaRetornoVal = raw.fecha_retorno || comp.fechas?.retorno;
  
  const isCombustibleView = (raw.codigo || comp.codigo || id)?.toString().startsWith('CB-');

  // Reasignar solo permitido antes de la ejecución y SOLO para Transporte (nunca para Combustible)
  const canReasignar = !isCombustibleView && (status === 'pre_aprobada' || status === 'aprobada' || status === 'programada');

  // Valores a mostrar
  const solicitanteName = raw.solicitante?.name || raw.solicitante?.nombre || (typeof raw.solicitante === 'string' ? raw.solicitante : '') || comp.solicitante || 'N/A';
  const destino = raw.destino || comp.destino || raw.destino_actividad || 'N/A';
  const horasEstimadas = Math.abs(raw.horas_estimadas || comp.horas_estimadas || 0);
  const motivo = raw.motivo || comp.motivo || raw.observaciones || 'Sin motivo';
  const decisionFinal = raw.decision_final || comp.decision_final || status;
  
  // Asignaciones finales
  const motoristaFinal = raw.motorista?.nombre || comp.motorista_nombre || data.comparativa?.operativo?.motorista?.nombre || data.comparativa?.operativo?.autor || 'Sin asignar';
  const vehiculoFinal = raw.vehiculo?.placa || comp.vehiculo_placa || data.comparativa?.operativo?.vehiculo?.placa || 'Sin asignar';
  const vehiculoMarca = raw.vehiculo?.marca || comp.vehiculo_marca || data.comparativa?.operativo?.vehiculo?.marca || '';
  const montoFinal = raw.monto_aprobado || comp.monto_aprobado || data.comparativa?.operativo?.monto_aprobado || null;
  const comentarioJefe = raw.comentario_jefe || comp.comentario_jefe || raw.comentario || 'Sin comentario';

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
        <Link to="/historial" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={16} /> Volver al Historial
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Detalle de Solicitud <span className="text-slate-500 font-medium">#{raw.codigo || comp.codigo || id}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Información completa del proceso.</p>
          </div>
          <span className={`px-4 py-1.5 ${statusInfo.bg} ${statusInfo.border} border rounded-full text-sm font-semibold ${statusInfo.text} flex items-center gap-2 shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card: Datos del Viaje / Combustible */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            <FileText className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">{isCombustibleView ? 'Datos de Combustible' : 'Datos del Viaje'}</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="text-sm text-slate-800 font-medium">{solicitanteName}</p>
            </div>
            
            {!isCombustibleView && (
              <>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={12} /> Destino
                  </p>
                  <p className="text-sm text-slate-800 font-medium">{destino}</p>
                </div>
                <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-lg">
                  <div className="bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Salida
                    </p>
                    <p className="text-xs text-slate-800 font-medium">
                      {fechaSalidaVal ? new Date(fechaSalidaVal).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={12} /> Retorno
                    </p>
                    <p className="text-xs text-slate-800 font-medium">
                      {fechaRetornoVal ? new Date(fechaRetornoVal).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock size={12} /> Horas Estimadas
                  </p>
                  <p className="text-sm text-slate-800 font-medium">{horasEstimadas} hrs</p>
                </div>
              </>
            )}

            {isCombustibleView && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Solicitud
                </p>
                <p className="text-sm text-slate-800 font-medium">
                  {raw.created_at ? new Date(raw.created_at).toLocaleString() : (comp.fecha_solicitud ? new Date(comp.fecha_solicitud).toLocaleString() : 'N/A')}
                </p>
              </div>
            )}

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo / Observación</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{motivo}"
              </p>
            </div>
          </div>
        </div>

        {/* Card: Asignación Actual */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            {isAprobada ? <CheckCircle className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />}
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">
              {isAprobada ? 'Asignación Aprobada' : 'Decisión Final'}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Decisión</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${isAprobada ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {decisionFinal}
              </span>
            </div>

            {isCombustibleView ? (
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} /> Vales Aprobados
                </p>
                <p className="text-xl font-black text-emerald-600">
                  {montoFinal !== null && montoFinal !== undefined ? `$${Number(montoFinal).toFixed(2)}` : 'Sin asignar'}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={12} /> Motorista Asignado
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    {motoristaFinal}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Car size={12} /> Vehículo Asignado
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    {vehiculoFinal}
                  </p>
                  {vehiculoMarca && (
                    <p className="text-xs text-slate-500">
                      {vehiculoMarca}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comentario del Jefe</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{comentarioJefe}"
              </p>
            </div>
          </div>

          {/* Botón de Reasignar */}
          {canReasignar && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={openReasignarModal}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#3b32c9] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
              >
                <RefreshCw size={18} />
                Reasignar Motorista / Vehículo
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Puedes cambiar la asignación solo si el viaje aún no está en ejecución.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Reasignación */}
      {showReasignarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Reasignar Recursos</h3>
                <p className="text-xs text-slate-500 mt-1">Selecciona el nuevo motorista y vehículo disponible.</p>
              </div>
              <button onClick={() => setShowReasignarModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {loadingRecursos ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5]"></div>
                </div>
              ) : (
                <>
                  {/* Selector de Vehículo */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Car size={12} /> Nuevo Vehículo
                    </label>
                    <select
                      value={selectedVehiculo}
                      onChange={(e) => setSelectedVehiculo(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Seleccionar vehículo --</option>
                      {recursos?.vehiculos.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.label || `${v.placa} — ${v.marca}`} {v.nivel_combustible ? `(Combustible: ${v.nivel_combustible.label})` : ''}
                        </option>
                      ))}
                    </select>
                    {recursos?.vehiculos.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">No hay vehículos disponibles en este horario.</p>
                    )}
                  </div>

                  {/* Selector de Motorista */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <User size={12} /> Nuevo Motorista
                    </label>
                    <select
                      value={selectedMotorista}
                      onChange={(e) => setSelectedMotorista(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    >
                      <option value="">-- Seleccionar motorista --</option>
                      {recursos?.motoristas.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.nombre} {m.dui ? `(${m.dui})` : ''}
                        </option>
                      ))}
                    </select>
                    {recursos?.motoristas.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1">No hay motoristas disponibles en este horario.</p>
                    )}
                  </div>

                  {/* Motivo */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Motivo de la reasignación (obligatorio)
                    </label>
                    <textarea
                      value={motivoReasignacion}
                      onChange={(e) => setMotivoReasignacion(e.target.value)}
                      placeholder="Ej: Motorista original reportó enfermedad..."
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-[10px] font-medium ${motivoReasignacion.trim().length < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        Mínimo 10 caracteres
                      </p>
                      <p className={`text-[10px] font-bold ${motivoReasignacion.trim().length < 10 ? 'text-slate-400' : 'text-emerald-600'}`}>
                        {motivoReasignacion.trim().length}/10
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowReasignarModal(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleReasignar}
                disabled={isSubmitting || !selectedVehiculo || !selectedMotorista || motivoReasignacion.trim().length < 10}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#3b32c9] text-white font-bold rounded-xl hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Procesando...</>
                ) : (
                  <><RefreshCw size={16} /> Confirmar Reasignación</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
