import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, FileText, User, Car, RefreshCw, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { axiosClient } from '../../../shared/api/axiosClient';
import { ModalDestinoAdicional } from '../components/ModalDestinoAdicional';
import { useReasignacion } from '../hooks/useReasignacion';
import { ModalReasignarViaje } from '../components/ModalReasignarViaje';

export interface HistorialDataDetalle {
  raw?: any;
  comparativa?: any;
}

export default function HistorialDetallePage() {
  const { codigo } = useParams();
  const [data, setData] = useState<HistorialDataDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reasignación
  const {
    showReasignarModal, setShowReasignarModal, recursos, loadingRecursos,
    selectedVehiculo, setSelectedVehiculo, selectedMotorista, setSelectedMotorista,
    motivoReasignacion, setMotivoReasignacion, isSubmitting, openReasignarModal, handleReasignar
  } = useReasignacion(codigo, () => {
    if (!codigo) return;
    const codeUpper = codigo.toUpperCase();
    const isComb = codeUpper.startsWith('CB-');
    const isMant = codeUpper.startsWith('SM-') || codeUpper.startsWith('MAN-') || codeUpper.startsWith('MANT-') || codeUpper.startsWith('MT-');
    const ep = isComb ? `/solicitudes-combustible/${codigo}` : isMant ? `/solicitudes-mantenimiento/${codigo}` : `/solicitudes-transporte/${codigo}`;

    axiosClient.get(ep).then((showRes) => {
      setData((prev) => ({ ...prev, raw: showRes.data.data || showRes.data }));
    }).catch(e => console.error('Error refreshing detail after reasignar', e));
  });

  // Destino Adicional
  const [showDestinoModal, setShowDestinoModal] = useState(false);

  useEffect(() => {
    if (!codigo) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        let showData = null;
        let compData = null;

        const codeUpper = (codigo || '').toUpperCase();
        const isCombustible = codeUpper.startsWith('CB-');
        const isMantenimiento = codeUpper.startsWith('SM-') || codeUpper.startsWith('MAN-') || codeUpper.startsWith('MANT-') || codeUpper.startsWith('MT-');
        const endpoint = isCombustible 
          ? `/solicitudes-combustible/${codigo}` 
          : isMantenimiento 
            ? `/solicitudes-mantenimiento/${codigo}` 
            : `/solicitudes-transporte/${codigo}`;

        // 1. Obtener los datos reales finales (estado, asignación real)
        try {
          const showRes = await axiosClient.get(endpoint);
          showData = showRes.data.data || showRes.data;
        } catch (e) {
          // Si el endpoint inicial devolvió 404, intentar con los otros módulos
          const fallbackEndpoints = [
            `/solicitudes-transporte/${codigo}`,
            `/solicitudes-mantenimiento/${codigo}`,
            `/solicitudes-combustible/${codigo}`
          ].filter(ep => ep !== endpoint);

          for (const altEp of fallbackEndpoints) {
            try {
              const altRes = await axiosClient.get(altEp);
              if (altRes.data) {
                showData = altRes.data.data || altRes.data;
                break;
              }
            } catch {
              // Continuar
            }
          }
        }

        // 2. Obtener la comparativa (SOLO si es Transporte)
        if (!isMantenimiento && !isCombustible) {
          try {
            const compRes = await axiosClient.get(`${endpoint}/comparativa`);
            compData = compRes.data;
          } catch (e) {
            // Comparativa no disponible
          }
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
  }, [codigo]);



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
  const isEnEjecucion = status.includes('ejecucion');

  const getStatusColor = () => {
    if (isAprobada) return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Aprobada' };
    if (isRechazada) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', label: 'Rechazada' };
    if (status.includes('ejecucion')) return { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'En Ejecución' };
    return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', dot: 'bg-slate-500', label: status || 'Desconocido' };
  };

  const statusInfo = getStatusColor();
  const fechaSalidaVal = raw.fecha_salida || comp.fechas?.salida;
  const fechaRetornoVal = raw.fecha_retorno || comp.fechas?.retorno;
  
  const codeUpper = (raw.codigo || comp.codigo || codigo || '').toString().toUpperCase();
  const moduloStr = (raw.modulo || raw.tipo || raw.type || '').toString().toLowerCase();

  const isCombustibleView = codeUpper.startsWith('CB-') || moduloStr === 'combustible';
  const isMantenimientoView = 
    codeUpper.startsWith('SM-') || 
    codeUpper.startsWith('MAN-') || 
    codeUpper.startsWith('MANT-') || 
    codeUpper.startsWith('MT-') || 
    moduloStr === 'mantenimiento';
  const isTransporteView = !isCombustibleView && !isMantenimientoView;

  // Reasignar solo permitido antes de la ejecución y SOLO para Transporte (nunca para Combustible o Mantenimiento)
  const canReasignar = isTransporteView && (status === 'pre_aprobada' || status === 'aprobada' || status === 'programada');

  // Añadir destino adicional solo en ejecución y SOLO para Transporte
  const canAddDestino = isTransporteView && status === 'en_ejecucion';

  // Valores a mostrar
  const solicitanteName = raw.solicitante?.name || raw.solicitante?.nombre || (typeof raw.solicitante === 'string' ? raw.solicitante : '') || comp.solicitante || 'N/A';
  const destino = raw.destino || comp.destino || raw.destino_actividad || 'N/A';
  const horasEstimadas = Math.abs(raw.horas_estimadas || comp.horas_estimadas || 0);
  const motivo = raw.motivo || comp.motivo || raw.observaciones || 'Sin motivo';
  const decisionFinal = raw.decision_final || comp.decision_final || status;
  
  // Asignaciones finales de transporte
  const motoristaFinal = raw.motorista?.nombre || comp.motorista_nombre || data.comparativa?.operativo?.motorista?.nombre || data.comparativa?.operativo?.autor || 'Sin asignar';
  const vehiculoFinal = raw.vehiculo?.placa || comp.vehiculo_placa || data.comparativa?.operativo?.vehiculo?.placa || 'Sin asignar';
  const vehiculoMarca = raw.vehiculo?.marca || comp.vehiculo_marca || data.comparativa?.operativo?.vehiculo?.marca || '';
  
  // Valores específicos de mantenimiento
  const vehiculoMantenimientoMarca = typeof raw.vehiculo === 'object' ? (raw.vehiculo?.marca || raw.vehiculo?.nombre) : (raw.vehiculo || '');
  const vehiculoMantenimientoPlaca = raw.placa || (typeof raw.vehiculo === 'object' ? raw.vehiculo?.placa : '') || comp.vehiculo_placa || '';
  const tipoMantenimientoNombre = typeof raw.tipo_mantenimiento === 'object' ? raw.tipo_mantenimiento?.nombre : (raw.tipo_mantenimiento || 'General');
  const kilometrajeVal = raw.kilometraje_actual || raw.kilometraje || null;

  // El jefe guarda su decisión manual en cantidad_combustible (en show API) o cantidad_estimada (en comparativa API)
  const montoFinal = raw.cantidad_combustible || comp.cantidad_estimada || raw.monto_aprobado || comp.monto_aprobado || data.comparativa?.operativo?.monto_aprobado || null;
  const comentarioJefe = raw.comentario_jefe || comp.comentario_jefe || raw.comentario || 'Sin comentario';
  
  // Prioridad
  const prioridadRaw = raw.prioridad_grupo?.value || raw.prioridad_grupo || comp.prioridad_grupo || raw.prioridad?.value || raw.prioridad || comp.prioridad || 'N/A';
  const prioridad = typeof prioridadRaw === 'string' ? prioridadRaw.toLowerCase() : prioridadRaw;
  const getPrioridadColor = (p: string) => {
    if (p.includes('alta') || p.includes('urgente')) return 'bg-red-50 text-red-700 border-red-200';
    if (p.includes('media')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (p === 'n/a') return 'bg-slate-50 text-slate-700 border-slate-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

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
              Detalle de Solicitud <span className="text-slate-500 font-medium">#{raw.codigo || comp.codigo || codigo}</span>
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
        {/* Card: Datos de la Solicitud */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-slate-200">
            <FileText className="text-slate-400" size={18} />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">
              {isCombustibleView ? 'Datos de Combustible' : isMantenimientoView ? 'Datos de Mantenimiento' : 'Datos del Viaje'}
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Solicitante</p>
                <p className="text-sm text-slate-800 font-medium">{solicitanteName}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Prioridad</p>
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold capitalize border ${getPrioridadColor(prioridad)}`}>
                  {prioridadRaw}
                </span>
              </div>
            </div>
            
            {isTransporteView && (
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

            {isMantenimientoView && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Car size={12} /> Vehículo
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {vehiculoMantenimientoMarca || vehiculoMantenimientoPlaca || 'N/A'}
                      {vehiculoMantenimientoPlaca && vehiculoMantenimientoMarca && (
                        <span className="text-slate-500 font-normal ml-1">({vehiculoMantenimientoPlaca})</span>
                      )}
                    </p>
                    {kilometrajeVal && (
                      <p className="text-xs text-slate-500 mt-0.5">Km: {kilometrajeVal} km</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Wrench size={12} /> Tipo Mantenimiento
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {tipoMantenimientoNombre}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar size={12} /> Fecha Sugerida
                  </p>
                  <p className="text-sm text-slate-800 font-medium">
                    {raw.fecha_sugerida ? new Date(raw.fecha_sugerida).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </>
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
            {isEnEjecucion ? <MapPin className="text-indigo-500" size={18} /> : (isAprobada ? <CheckCircle className="text-emerald-500" size={18} /> : <XCircle className="text-red-500" size={18} />)}
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">
              {isEnEjecucion ? (isMantenimientoView ? 'En Mantenimiento' : 'Viaje en Curso') : (isAprobada ? (isMantenimientoView ? 'Mantenimiento Aprobado' : 'Asignación Aprobada') : 'Decisión Final')}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado Actual</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                {decisionFinal}
              </span>
            </div>

            {isCombustibleView ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <FileText size={12} /> Cargas Aprobadas
                  </p>
                  <p className="text-xl font-black text-emerald-600">
                    {montoFinal !== null && montoFinal !== undefined ? `$${Number(montoFinal).toFixed(2)}` : 'Sin asignar'}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Car size={12} /> Vehículo (Placa)
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {vehiculoFinal}
                  </p>
                  {vehiculoMarca && (
                    <p className="text-xs text-slate-500">
                      {vehiculoMarca}
                    </p>
                  )}
                </div>
              </div>
            ) : isMantenimientoView ? (
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Car size={12} /> Vehículo a Taller
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {vehiculoMantenimientoMarca || vehiculoMantenimientoPlaca || 'Sin especificar'}
                  </p>
                  {vehiculoMantenimientoPlaca && vehiculoMantenimientoMarca && (
                    <p className="text-xs text-slate-500">
                      Placa: {vehiculoMantenimientoPlaca}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wrench size={12} /> Servicio
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {tipoMantenimientoNombre}
                  </p>
                </div>
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
                onClick={() => openReasignarModal(fechaSalidaVal, fechaRetornoVal)}
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

          {/* Botón de Añadir Destino en Ejecución */}
          {canAddDestino && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowDestinoModal(true)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#859BFF] hover:bg-[#7288f5] text-white font-bold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm"
              >
                <MapPin size={18} />
                Añadir Destino Adicional
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Modifica la ruta enviando un nuevo destino en tiempo real al motorista.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Reasignación */}
      <ModalReasignarViaje
        isOpen={showReasignarModal}
        onClose={() => setShowReasignarModal(false)}
        loadingRecursos={loadingRecursos}
        recursos={recursos}
        selectedVehiculo={selectedVehiculo}
        setSelectedVehiculo={setSelectedVehiculo}
        selectedMotorista={selectedMotorista}
        setSelectedMotorista={setSelectedMotorista}
        motivoReasignacion={motivoReasignacion}
        setMotivoReasignacion={setMotivoReasignacion}
        isSubmitting={isSubmitting}
        onConfirm={handleReasignar}
      />

      {/* Modal de Destino Adicional */}
      <ModalDestinoAdicional 
        isOpen={showDestinoModal}
        onClose={() => setShowDestinoModal(false)}
        solicitudId={raw.codigo ?? comp.codigo ?? codigo ?? ''}
        onSuccess={() => {
          setShowDestinoModal(false);
          // Recargar datos para reflejar el cambio si el backend devuelve el nuevo campo
          axiosClient.get(`/solicitudes-transporte/${codigo}`).then(res => {
            setData((prev: any) => ({ ...prev, raw: res.data.data || res.data }));
          });
        }}
      />
    </div>
  );
}
