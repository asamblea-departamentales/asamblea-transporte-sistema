import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { useAprobacionCombustible } from '../hooks/useAprobacionCombustible';
import { ColumnaCombustibleSolicitud } from '../components/ColumnaCombustibleSolicitud';
import { ColumnaCombustibleOperativo } from '../components/ColumnaCombustibleOperativo';

export default function AprobacionCombustiblePage() {
  const { id } = useParams();
  const { 
    data, 
    isLoading, 
    error,
    comentario,
    setComentario,
    tipoDecision,
    setTipoDecision,
    montoManual,
    setMontoManual,
    confirmarAprobacion,
    handleObservacion,
    handlePreAprobar,
    handleRechazar,
    isSubmitting 
  } = useAprobacionCombustible(id);

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

  const solicitud = data.solicitud || data;

  return (
    <div className="flex-1 p-4 md:p-8 pb-48 md:pb-32 max-w-[1400px] mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Aprobación de Combustible <span className="text-slate-500 font-medium">#{solicitud.id || id}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Revisa la asignación del operativo y aprueba o modifica el monto.</p>
          </div>
        </div>
      </div>

      {/* Banner de decisión previa */}
      {solicitud.decision_final && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm md:text-base">Solicitud pre-aprobada</h4>
            <p className="text-xs md:text-sm text-blue-800 mt-1">
              Esta solicitud ya fue gestionada. Puedes modificarla o regresar al dashboard.
            </p>
          </div>
        </div>
      )}

      {/* 2 Columns Layout (Combustible) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
        <ColumnaCombustibleSolicitud solicitud={solicitud} />
        
        <ColumnaCombustibleOperativo 
          data={data.operativo} 
          isSelected={true}
          isFaded={false}
          onSelect={() => {}}
        />
      </div>

      {/* FINALIZACIÓN */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <CheckCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Decisión Final (Vales)</h2>
            <p className="text-slate-500 text-sm">Verifica la asignación y autoriza los vales de combustible.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Decision Type */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Monto a Aprobar</label>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${tipoDecision === 'mantener' ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-slate-50 border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="tipoDecision"
                  className="w-4 h-4 text-primary mt-1 self-start"
                  checked={tipoDecision === 'mantener'} 
                  onChange={() => setTipoDecision('mantener')} 
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800 text-sm">Mantener sugerido</span>
                  <span className="text-xs text-slate-500 mt-1">Aprobar los vales solicitados/sugeridos ({data.operativo?.monto_aprobado || 0})</span>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${tipoDecision === 'manual' ? 'bg-primary/5 border-primary shadow-sm' : 'hover:bg-slate-50 border-slate-200'}`}>
                <input 
                  type="radio" 
                  name="tipoDecision"
                  className="w-4 h-4 text-primary mt-1 self-start"
                  checked={tipoDecision === 'manual'} 
                  onChange={() => setTipoDecision('manual')} 
                />
                <div className="flex flex-col w-full">
                  <span className="font-semibold text-slate-800 text-sm">Monto manual</span>
                  <span className="text-xs text-slate-500 mt-1 mb-3">Ingresar una cantidad distinta de vales</span>
                  {tipoDecision === 'manual' && (
                    <input 
                      type="number"
                      placeholder="Ej. 30"
                      min="1"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm"
                      value={montoManual}
                      onChange={(e) => setMontoManual(e.target.value === '' ? '' : Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col h-full">
            <label className="block text-sm font-bold text-slate-700 mb-4">Comentario / Observación</label>
            <textarea 
              placeholder="Ingresa una justificación (Obligatorio para rechazar u observar)"
              className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[150px]"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
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
            Guardar Observación
          </button>

          <button 
            onClick={handlePreAprobar}
            disabled={isSubmitting}
            className="w-full md:w-auto px-6 py-2.5 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm"
          >
            Pre-Aprobar
          </button>
          
          <button 
            onClick={confirmarAprobacion}
            disabled={isSubmitting || (tipoDecision === 'manual' && (!montoManual || montoManual <= 0))}
            className="w-full md:w-auto px-8 py-2.5 font-bold rounded-lg text-white transition-all shadow-md bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? 'Procesando...' : 'Aprobar Vales Oficialmente'}
          </button>
        </div>
      </div>
    </div>
  );
}
