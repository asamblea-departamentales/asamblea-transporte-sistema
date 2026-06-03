import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { useAprobacion } from '../hooks/useAprobacion';
import { ColumnaViaje } from '../components/ColumnaViaje';
import { ColumnaOperativo } from '../components/ColumnaOperativo';
import { ColumnaSistema } from '../components/ColumnaSistema';

export default function AprobacionPage() {
  const { id } = useParams();
  const { 
    data, 
    isLoading, 
    error,
    decision,
    setDecision,
    comentario,
    setComentario,
    confirmarAprobacion,
    handleProgramar,
    handleRechazar,
    handleDesbloquear,
    isSubmitting 
  } = useAprobacion(id);

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
              Aprobación de Solicitud <span className="text-slate-500 font-medium">#{data.solicitud.id}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Revisa la información del viaje y elige la asignación adecuada.</p>
          </div>
        </div>
      </div>

      {/* Banner de decisión previa */}
      {data.solicitud.decision_final && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm md:text-base">Solicitud consolidada</h4>
            <p className="text-xs md:text-sm text-blue-800 mt-1">
              Esta solicitud ya fue pre-aprobada con la opción <span className="font-bold uppercase">{data.solicitud.decision_final}</span>. 
              Puedes actualizar la decisión o <strong>Programar el Viaje</strong> definitivamente.
            </p>
          </div>
        </div>
      )}

      {/* 3 Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        <ColumnaViaje solicitud={data.solicitud} />
        
        <ColumnaOperativo 
          data={data.operativo} 
          isSelected={decision === 'operativo'}
          isFaded={decision === 'sistema'}
          onSelect={() => setDecision('operativo')}
        />
        
        <ColumnaSistema 
          data={data.sistema} 
          isSelected={decision === 'sistema'}
          isFaded={decision === 'operativo'}
          onSelect={() => setDecision('sistema')}
        />
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 md:left-[260px] right-0 bg-white border-t border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hidden md:flex items-center justify-center border border-slate-200 shrink-0">
            <CheckCircle size={20} />
          </div>
          <div className="w-full text-center md:text-left">
            <h4 className="font-bold text-slate-800 text-md tracking-tight hidden md:block">Paso Final</h4>
            <p className="text-xs text-slate-500">Selecciona una opción arriba y añade un comentario.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Comentario (obligatorio)"
            className="px-3 py-2 border border-slate-300 rounded text-sm w-full md:w-72 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />

          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
            <button 
              onClick={handleRechazar}
              disabled={isSubmitting || !comentario.trim()}
              className="flex-1 md:flex-none px-4 py-2 bg-white border border-danger text-danger font-medium rounded hover:bg-danger/5 transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed text-center"
            >
              Rechazar
            </button>
            
            {data.solicitud.decision_final && (
              <button 
                onClick={handleDesbloquear}
                disabled={isSubmitting}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm underline disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            )}
            
            <button 
              onClick={confirmarAprobacion}
              disabled={isSubmitting || decision === 'ninguna' || !comentario.trim()}
              className={`flex-1 md:flex-none px-6 py-2 font-medium rounded text-white transition-all text-sm shadow-sm text-center ${
                decision === 'operativo' ? 'bg-primary hover:bg-primary-hover' :
                decision === 'sistema' ? 'bg-success hover:bg-success-hover' :
                'bg-slate-300 cursor-not-allowed'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Procesando...' : 
               (data.solicitud.decision_final ? 'Actualizar' :
                (decision === 'operativo' ? 'Aprobar Manual' : 
                 decision === 'sistema' ? 'Aprobar Sistema' : 
                 'Seleccionar')
               )}
            </button>
            
            {data.solicitud.decision_final && (
              <button 
                onClick={handleProgramar}
                disabled={isSubmitting}
                className="w-full md:w-auto mt-2 md:mt-0 px-6 py-2 font-bold rounded bg-slate-800 hover:bg-slate-900 text-white transition-all text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Programar Viaje <CheckCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
