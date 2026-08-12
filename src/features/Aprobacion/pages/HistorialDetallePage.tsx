import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { axiosClient } from '../../../shared/api/axiosClient';
import { ModalDestinoAdicional } from '../components/ModalDestinoAdicional';
import { useReasignacion } from '../hooks/useReasignacion';
import { ModalReasignarViaje } from '../components/ModalReasignarViaje';
import { HistorialDetalleHeader } from '../components/historial/HistorialDetalleHeader';
import { DatosSolicitudCard } from '../components/historial/DatosSolicitudCard';
import { AsignacionCard } from '../components/historial/AsignacionCard';

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
        } catch {
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
          } catch {
            // Comparativa no disponible
          }
        }

        if (!showData && !compData) {
          setError('No se pudo cargar el detalle de la solicitud.');
          return;
        }

        setData({ raw: showData, comparativa: compData });
      } catch (err: unknown) {
        const responseMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
        setError(typeof responseMessage === 'string' ? responseMessage : 'Error inesperado al cargar.');
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
  return (
    <div className="p-4 md:p-8 pb-20 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <HistorialDetalleHeader
        codigo={raw.codigo || comp.codigo || codigo || ''}
        statusInfo={statusInfo}
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DatosSolicitudCard
          isTransporteView={isTransporteView}
          isCombustibleView={isCombustibleView}
          isMantenimientoView={isMantenimientoView}
          solicitanteName={solicitanteName}
          prioridadRaw={prioridadRaw}
          prioridad={prioridad}
          destino={destino}
          fechaSalidaVal={fechaSalidaVal}
          fechaRetornoVal={fechaRetornoVal}
          horasEstimadas={horasEstimadas}
          motivo={motivo}
          rawCreatedAt={raw.created_at}
          compFechaSolicitud={comp.fecha_solicitud}
          vehiculoMantenimientoMarca={vehiculoMantenimientoMarca}
          vehiculoMantenimientoPlaca={vehiculoMantenimientoPlaca}
          tipoMantenimientoNombre={tipoMantenimientoNombre}
          kilometrajeVal={kilometrajeVal}
          rawFechaSugerida={raw.fecha_sugerida}
        />

        <AsignacionCard
          isAprobada={isAprobada}
          isEnEjecucion={isEnEjecucion}
          isCombustibleView={isCombustibleView}
          isMantenimientoView={isMantenimientoView}
          statusInfo={statusInfo}
          decisionFinal={decisionFinal}
          motoristaFinal={motoristaFinal}
          vehiculoFinal={vehiculoFinal}
          vehiculoMarca={vehiculoMarca}
          montoFinal={montoFinal}
          vehiculoMantenimientoMarca={vehiculoMantenimientoMarca}
          vehiculoMantenimientoPlaca={vehiculoMantenimientoPlaca}
          tipoMantenimientoNombre={tipoMantenimientoNombre}
          comentarioJefe={comentarioJefe}
          canReasignar={canReasignar}
          canAddDestino={canAddDestino}
          onReasignar={() => openReasignarModal(fechaSalidaVal, fechaRetornoVal)}
          onAddDestino={() => setShowDestinoModal(true)}
        />
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
            setData(prev => ({ ...prev, raw: res.data.data || res.data }));
          });
        }}
      />
    </div>
  );
}
