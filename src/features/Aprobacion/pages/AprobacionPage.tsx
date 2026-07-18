import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Info, Map as MapIcon, Users, PenTool, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAprobacion } from '../hooks/useAprobacion';
import { ColumnaViaje } from '../components/ColumnaViaje';
import { ColumnaOperativo } from '../components/ColumnaOperativo';
import { ColumnaSistema } from '../components/ColumnaSistema';
import { MapaViaje } from '../components/MapaViaje';
import { ModalDestinoAdicional } from '../components/ModalDestinoAdicional';
import { extractStatusString } from '../../../shared/api/apiMapper';

export default function AprobacionPage() {
  const { codigo } = useParams();
  const [step, setStep] = useState(1);
  const [isModalDestinoOpen, setIsModalDestinoOpen] = useState(false);
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
  } = useAprobacion(codigo);

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
  const statusStr = extractStatusString(solicitud.estado);
  const isEnEjecucion = statusStr.toLowerCase().includes('ejecucion');

  const nextStep = () => setStep(s => Math.min(3, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const steps = [
    { num: 1, title: 'Contexto del Viaje', icon: <MapIcon size={18} /> },
    { num: 2, title: 'Evaluación de Recursos', icon: <Users size={18} /> },
    { num: 3, title: 'Finalización', icon: <PenTool size={18} /> }
  ];

  return (
    <div className="flex-1 p-4 md:p-8 pb-48 md:pb-32 max-w-[1400px] mx-auto bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 border-b border-slate-200 pb-4 mt-2">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-3">
          <ArrowLeft size={16} /> Volver al Dashboard
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
              Aprobación de Solicitud <span className="text-slate-500 font-medium">#{solicitud.codigo || codigo}</span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Sigue los pasos para revisar y autorizar esta solicitud.</p>
          </div>
          {/* Stepper (oculto si está en ejecución) */}
          {!isEnEjecucion && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm overflow-x-auto max-w-full">
              {steps.map((s, idx) => (
                <React.Fragment key={s.num}>
                  <div 
                    onClick={() => setStep(s.num)}
                    className={`flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
                      step === s.num ? 'text-primary font-bold' : 
                      step > s.num ? 'text-success font-medium' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      step === s.num ? 'bg-primary/10 text-primary' : 
                      step > s.num ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {step > s.num ? <CheckCircle size={14} /> : s.num}
                    </div>
                    <span className="text-sm hidden md:block">{s.title}</span>
                  </div>
                  {idx < steps.length - 1 && <div className="w-4 h-[1px] bg-slate-300 mx-2 shrink-0"></div>}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner de decisión previa */}
      {!isEnEjecucion && solicitud.decision_final && (
        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
          <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 text-sm md:text-base">Solicitud consolidada</h4>
            <p className="text-xs md:text-sm text-blue-800 mt-1">
              Esta solicitud ya fue pre-aprobada con la opción <span className="font-bold uppercase">{solicitud.decision_final}</span>. 
              Puedes actualizar la decisión o <strong>Programar el Viaje</strong> definitivamente.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="mb-8 min-h-[500px]">

        {/* VISTA ESPECIAL: EN EJECUCIÓN */}
        {isEnEjecucion && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-8 text-center mb-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#859BFF]"></div>
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 text-[#859BFF]">
                <MapIcon size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Vehículo en Ruta</h2>
              <p className="text-slate-500 mb-8 max-w-lg mx-auto">
                Este viaje ya fue aprobado y actualmente se encuentra en ejecución. Puedes monitorear su progreso o modificar la ruta enviando un nuevo destino al motorista.
              </p>
              <button 
                onClick={() => setIsModalDestinoOpen(true)}
                className="inline-flex items-center gap-2 px-8 py-3 font-bold rounded-lg text-white transition-all shadow-md bg-[#859BFF] hover:bg-[#7288f5]"
              >
                <MapIcon size={18} /> Añadir Destino Adicional
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch min-h-[400px]">
              <div className="lg:col-span-3 h-full min-h-[400px]">
                <MapaViaje 
                  origen={solicitud.origen || 'Asamblea Legislativa'} 
                  destino={solicitud.destino} 
                  origen_lat={solicitud.origen_lat}
                  origen_lng={solicitud.origen_lng}
                  destino_lat={solicitud.destino_lat}
                  destino_lng={solicitud.destino_lng}
                />
              </div>
              <div className="lg:col-span-2 h-full">
                <ColumnaViaje solicitud={solicitud} />
              </div>
            </div>
          </div>
        )}

        {/* PASO 1: MAPA Y DATOS */}
        {!isEnEjecucion && step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch min-h-[500px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-3 h-full min-h-[400px]">
              <MapaViaje 
                origen={solicitud.origen || 'Asamblea Legislativa de El Salvador'} 
                destino={solicitud.destino} 
                origen_lat={solicitud.origen_lat}
                origen_lng={solicitud.origen_lng}
                destino_lat={solicitud.destino_lat}
                destino_lng={solicitud.destino_lng}
              />
            </div>
            <div className="lg:col-span-2 h-full">
              <ColumnaViaje solicitud={solicitud} />
            </div>
          </div>
        )}

        {/* PASO 2: RECURSOS */}
        {!isEnEjecucion && step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        )}

        {/* PASO 3: FINALIZACIÓN */}
        {!isEnEjecucion && step === 3 && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-600">
              <PenTool size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Final de Proceso</h2>
            <p className="text-slate-500 mb-8">
              Has seleccionado la asignación del <strong className="text-primary uppercase">{decision}</strong>. 
              Por favor, ingresa un comentario o justificación final para los registros de auditoría.
            </p>

            <div className="text-left mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Comentario Final (Obligatorio)</label>
              <textarea 
                placeholder="Ej: Aprobado según sugerencia del sistema por bajo nivel de fatiga."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[100px]"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleRechazar}
                disabled={isSubmitting || !comentario.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-danger text-danger font-bold rounded-lg hover:bg-danger/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Rechazar Viaje
              </button>
              
              <button 
                onClick={confirmarAprobacion}
                disabled={isSubmitting || decision === 'ninguna' || !comentario.trim()}
                className={`w-full sm:w-auto px-8 py-3 font-bold rounded-lg text-white transition-all shadow-md ${
                  decision === 'operativo' ? 'bg-primary hover:bg-primary-hover' :
                  decision === 'sistema' ? 'bg-success hover:bg-success-hover' :
                  'bg-slate-300 cursor-not-allowed'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? 'Procesando...' : 
                 (solicitud.decision_final ? 'Actualizar Decisión' : 'Aprobar Oficialmente')}
              </button>
            </div>

            {solicitud.decision_final && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button 
                  onClick={handleProgramar}
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 font-bold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Programar Viaje Definitivamente <CheckCircle size={18} />
                </button>
              </div>
            )}
            
            {solicitud.decision_final && (
              <button 
                onClick={handleDesbloquear}
                disabled={isSubmitting}
                className="mt-4 text-slate-500 hover:text-slate-800 font-medium transition-colors text-sm underline"
              >
                Resetear a estado Pendiente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Wizard Footer Navigation */}
      {!isEnEjecucion && (
        <div className="fixed bottom-0 left-0 md:left-[280px] right-0 bg-white border-t border-slate-200 p-4 flex justify-between items-center z-[100] shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <button 
            onClick={prevStep}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} /> Atrás
          </button>

          {step < 3 ? (
            <button 
              onClick={nextStep}
              disabled={step === 2 && decision === 'ninguna'}
              className="flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {step === 1 ? 'Siguiente: Evaluar Recursos' : 'Siguiente: Finalización'} <ChevronRight size={18} />
            </button>
          ) : (
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle size={16} /> Fin del Proceso
            </div>
          )}
        </div>
      )}

      {/* Modal de Destino Adicional */}
      <ModalDestinoAdicional 
        isOpen={isModalDestinoOpen}
        onClose={() => setIsModalDestinoOpen(false)}
        solicitudId={solicitud.codigo ?? codigo ?? ''}
        onSuccess={() => setIsModalDestinoOpen(false)}
      />
    </div>
  );
}
