import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info, Wrench, Calendar, Car, User } from 'lucide-react';
import { useAprobacionMantenimiento } from '../hooks/useAprobacionMantenimiento';
import { getEstadoString } from '../types';

export default function AprobacionMantenimientoPage() {
  const { codigo } = useParams();
  const { 
    data, 
    isLoading, 
    error,
    comentario,
    setComentario,
    handleAprobar,
    handleObservacion,
    handleRechazar,
    isSubmitting 
  } = useAprobacionMantenimiento(codigo);

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#859BFF]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-danger mb-4 font-medium">{error || 'Solicitud no encontrada'}</p>
        <Link to="/" className="text-[#859BFF] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
      </div>
    );
  }

  // Comprobar si ya estÃ¡ procesada
  const isProcesada = ['aprobada', 'rechazada', 'completada', 'en_ejecucion', 'programada'].includes(
    getEstadoString(data?.estado)
  );

  return (
    <div className="flex-1 p-4 md:p-8 pb-48 md:pb-32 max-w-[1000px] mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Wrench className="text-primary" />
               AprobaciÃ³n de Mantenimiento <span className="text-slate-500 font-medium">#{data.codigo || codigo}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Revisa los detalles del mantenimiento solicitado y autoriza el proceso.</p>
          </div>
        </div>
      </div>

      {/* DEBUG TEMPORAL PARA VER LOS CAMPOS DEL CONTRATO */}
      <div className="hidden" id="debug-mantenimiento-data" data-json={JSON.stringify(data)}></div>

      {/* Detalle de Solicitud */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h3 className="text-lg font-bold text-slate-800 mb-6 border-b pb-2">InformaciÃ³n del Mantenimiento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Solicitante</p>
              <p className="font-semibold text-slate-800">{typeof data.solicitante === 'object' ? (data.solicitante as { name?: string })?.name : data.solicitante || 'No especificado'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Car size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">VehÃ­culo / Placa</p>
              <p className="font-semibold text-slate-800">{typeof data.vehiculo === 'object' ? (data.vehiculo as { marca?: string; placa?: string })?.marca || 'VehÃ­culo' : data.vehiculo || 'VehÃ­culo desconocido'} <span className="text-slate-500 font-normal">({data.placa || (data.vehiculo as { marca?: string; placa?: string })?.placa || 'Sin placa'})</span></p>
              {data.kilometraje_actual && <p className="text-xs text-slate-500 mt-1">Kilometraje: {data.kilometraje_actual} km</p>}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Fecha Sugerida</p>
              <p className="font-semibold text-slate-800">
                {data.fecha_sugerida 
                  ? new Date(data.fecha_sugerida).toLocaleDateString('es-ES', { 
                      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' 
                    }) 
                  : 'No especificada'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <Info size={18} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tipo Mantenimiento</p>
              <p className="font-semibold text-slate-800">{typeof data.tipo_mantenimiento === 'object' ? (data.tipo_mantenimiento as { nombre?: string })?.nombre : data.tipo_mantenimiento || 'General / Desconocido'}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Motivo / DescripciÃ³n</p>
          <p className="text-sm text-slate-700 leading-relaxed">{data.motivo || 'Sin detalles proporcionados.'}</p>
        </div>
      </div>

      {/* FINALIZACIÃ“N o ESTADO ACTUAL */}
      {isProcesada ? (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Solicitud Ya Procesada</h2>
          <p className="text-slate-500 mb-6">Esta solicitud de mantenimiento se encuentra en estado: <span className="font-bold uppercase">{getEstadoString(data?.estado) || 'procesada'}</span> y no puede ser modificada.</p>
          <Link 
            to={`/historial/${data.codigo || codigo}`}
            className="inline-flex items-center justify-center px-6 py-3 font-bold rounded-lg text-white transition-all shadow-sm bg-primary hover:bg-primary-hover text-sm"
          >
            Ver en el Historial
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">DecisiÃ³n de Jefatura</h2>
              <p className="text-slate-500 text-sm">Autoriza o rechaza el envÃ­o a taller / mantenimiento.</p>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-4">Comentario / ObservaciÃ³n</label>
            <textarea 
              placeholder="Ingresa una justificaciÃ³n (Obligatorio para rechazar u observar)"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[120px]"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button 
              onClick={handleRechazar}
              disabled={isSubmitting || !comentario.trim()}
              className="w-full md:w-auto px-5 py-2.5 bg-white border border-danger text-danger font-bold rounded-lg hover:bg-danger/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              Rechazar
            </button>
            
            <button 
              onClick={handleObservacion}
              disabled={isSubmitting || !comentario.trim()}
              className="w-full md:w-auto px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              Guardar ObservaciÃ³n
            </button>

            <button 
              onClick={handleAprobar}
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-2.5 font-bold rounded-lg text-white transition-all shadow-md bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Procesando...' : 'Aprobar Mantenimiento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
