import { AlertTriangle } from "lucide-react";
import type { CombinedRequest } from "../../../hooks/useCombinedRequests";
import { FocusTrap } from "../../../components/ui/FocusTrap";

export function CancelModal({ cancelTarget, motivoCancelacion, setMotivoCancelacion, submittingCancel, cancelError, onConfirm, onClose }: {
  cancelTarget: CombinedRequest;
  motivoCancelacion: string;
  setMotivoCancelacion: (v: string) => void;
  submittingCancel: boolean;
  cancelError: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <FocusTrap onEscape={() => { if (!submittingCancel) onClose(); }}>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => { if (!submittingCancel) onClose(); }}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white p-6 shadow-2xl transition-all sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200" role="dialog" aria-modal="true" aria-label="Cancelar solicitud">
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <AlertTriangle className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black tracking-tight text-slate-900">¿Cancelar esta solicitud?</h3>
            <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
              La solicitud <strong className="text-slate-800">{cancelTarget.codigo}</strong> será cancelada de forma permanente. Esta acción es irreversible.
            </p>

            {cancelError && (
              <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.5} />
                {cancelError}
              </div>
            )}

            <div className="mt-5">
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Motivo de la cancelación <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Ej. Se canceló la reunión programada o los datos fueron ingresados con errores..."
                disabled={submittingCancel}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50 resize-none disabled:bg-slate-50"
              />
              <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                <span>Mínimo 10 caracteres</span>
                <span className={motivoCancelacion.trim().length >= 10 ? "text-emerald-500" : "text-slate-400"}>
                  {motivoCancelacion.trim().length} / 10
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { if (!submittingCancel) onClose(); }}
                disabled={submittingCancel}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
              >
                Volver atrás
              </button>
              <button
                onClick={onConfirm}
                disabled={submittingCancel || motivoCancelacion.trim().length < 10}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {submittingCancel ? (
                  <>
                    <svg className="h-3.5 w-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Cancelando...
                  </>
                ) : (
                  "Confirmar Cancelación"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
