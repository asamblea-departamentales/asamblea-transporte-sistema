import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, User, Car, RefreshCw, CheckCircle, XCircle, X } from 'lucide-react';
import { axiosClient } from '../../../shared/api/axiosClient';
import { solicitudApi, RecursoDisponible } from '../api/solicitudApi';

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
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClient.get(`/solicitudes-transporte/${id}/comparativa`);
        setData(response.data);
      } catch (_err: any) {
        try {
          const response = await axiosClient.get(`/solicitudes-transporte/${id}`);
          setData({ solicitud: response.data.data || response.data });
        } catch (err2: any) {
          setError(err2.response?.data?.message || 'No se pudo cargar el detalle de la solicitud.');
        }
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
      const solicitud = data.solicitud || data;
      const result = await solicitudApi.getRecursosDisponibles(
        solicitud.fechas?.salida,
        solicitud.fechas?.retorno
      );
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
      setSuccessMsg('¡Reasignación exitosa! El motorista y vehículo han sido actualizados.');
      setShowReasignarModal(false);
      // Recargar datos
      const response = await axiosClient.get(`/solicitudes-transporte/${id}/comparativa`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reasignar recursos.');
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

  const solicitud = data.solicitud || data;
  const status = (solicitud.status || solicitud.estado || '').toLowerCase();
  
  const isAprobada = status.includes('aprobada') || status.includes('programada');
  const isRechazada = status.includes('rechazada');

  const getStatusColor = () => {
    if (isAprobada) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Aprobada' };
    if (isRechazada) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Rechazada' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', label: status };
  };

  const statusInfo = getStatusColor();
  const fechaSalida = solicitud.fechas?.salida ? new Date(solicitud.fechas.salida) : null;
  const canReasignar = isAprobada && fechaSalida && fechaSalida > new Date();

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
              Detalle de Solicitud <span className="text-slate-500 font-medium">#{solicitud.id || id}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Información completa del viaje procesado.</p>
          </div>
          <span className={`px-4 py-1.5 ${statusInfo.bg} ${statusInfo.border} border rounded-full text-sm font-semibold ${statusInfo.text} flex items-center gap-2 shadow-sm`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-emerald-500 shrink-0" size={20} />
          <p className="text-sm text-emerald-800 font-medium">{successMsg}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-lg flex items-center gap-3">
          <XCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card: Datos del Viaje */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            <FileText className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Datos del Viaje</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.solicitante || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin size={12} /> Destino
              </p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.destino || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-lg">
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Salida
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {solicitud.fechas?.salida ? new Date(solicitud.fechas.salida).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Retorno
                </p>
                <p className="text-xs text-slate-800 font-medium">
                  {solicitud.fechas?.retorno ? new Date(solicitud.fechas.retorno).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Clock size={12} /> Horas Estimadas
              </p>
              <p className="text-sm text-slate-800 font-medium">{solicitud.horas_estimadas || 0} hrs</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{solicitud.motivo || 'Sin motivo'}"
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
                {solicitud.decision_final || status}
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} /> Motorista Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {data.operativo?.motorista?.nombre || solicitud.motorista_nombre || 'Sin asignar'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Car size={12} /> Vehículo Asignado
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {data.operativo?.vehiculo?.placa || solicitud.vehiculo_placa || 'Sin asignar'}
              </p>
              {(data.operativo?.vehiculo?.marca || solicitud.vehiculo_marca) && (
                <p className="text-xs text-slate-500">
                  {data.operativo?.vehiculo?.marca || solicitud.vehiculo_marca}
                </p>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comentario del Jefe</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                "{solicitud.comentario_jefe || 'Sin comentario'}"
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
                Puedes cambiar la asignación antes de la fecha de salida.
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
                          {v.label || `${v.placa} — ${v.marca}`}
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
                disabled={isSubmitting || !selectedVehiculo || !selectedMotorista || !motivoReasignacion.trim()}
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
