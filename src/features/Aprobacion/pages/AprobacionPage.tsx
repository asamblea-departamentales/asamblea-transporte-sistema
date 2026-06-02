import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
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
    <div className="flex-1 p-8 pb-32 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-title text-3xl font-extrabold text-slate-900">
              Aprobación de Solicitud <span className="text-[#859BFF]">#{data.solicitud.id}</span>
            </h1>
            <p className="text-slate-500 mt-1">Revisa la información del viaje y elige la asignación adecuada.</p>
          </div>
        </div>
      </div>

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
      <div className="fixed bottom-0 left-[260px] right-0 bg-white border-t border-slate-200 p-5 flex justify-between items-center z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#859BFF]/10 text-[#859BFF] flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 className="font-title font-bold text-slate-900 text-lg">Paso Final</h4>
            <p className="text-sm text-slate-500">Selecciona una opción arriba e ingresa un comentario opcional.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {decision !== 'ninguna' && (
            <input 
              type="text" 
              placeholder="Comentario de aprobación (opcional)"
              className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:border-[#859BFF] focus:ring-1 focus:ring-[#859BFF]"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          )}

          <button className="px-5 py-2.5 bg-white border border-danger text-danger font-semibold rounded-lg hover:bg-danger-light transition-colors text-sm">
            Rechazar Solicitud
          </button>
          
          <button 
            onClick={confirmarAprobacion}
            disabled={isSubmitting || decision === 'ninguna'}
            className={`px-8 py-2.5 font-semibold rounded-lg text-white transition-all text-sm shadow-md ${
              decision === 'operativo' ? 'bg-[#859BFF] hover:bg-[#7089f9]' :
              decision === 'sistema' ? 'bg-success hover:bg-emerald-600' :
              'bg-slate-300 cursor-not-allowed'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Procesando...' : 
             decision === 'operativo' ? 'Aprobar Asignación Manual' : 
             decision === 'sistema' ? 'Aprobar Sugerencia del Sistema' : 
             'Selecciona una opción'}
          </button>
        </div>
      </div>
    </div>
  );
}
