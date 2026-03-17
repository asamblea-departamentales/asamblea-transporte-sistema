import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ÉXITO (Modal Premium alineado con Transporte)
// ══════════════════════════════════════════════════════════════════════════════

export function SuccessScreen({ 
  onReset, 
  solicitudId 
}: { 
  onReset: () => void; 
  solicitudId?: string;
}) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 30);
    return () => clearTimeout(t);
  }, []);

  function go(path: string) {
    setShow(false);
    setTimeout(() => navigate(path), 280);
  }

  function handleReset() {
    setShow(false);
    setTimeout(onReset, 280);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        show ? "bg-black/40 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none"
      }`}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition-all delay-150 duration-500 ${
                show ? "scale-100 opacity-100" : "scale-75 opacity-0"
              }`}
            >
              <svg
                className="h-5 w-5 text-slate-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray: "28",
                    strokeDashoffset: show ? "0" : "28",
                    transition: "stroke-dashoffset 500ms 300ms ease",
                  }}
                />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                Solicitud registrada
              </p>
              <p className="text-base font-black text-slate-900">
                Enviada correctamente
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          className={`px-6 py-5 transition-all delay-200 duration-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {solicitudId && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Código
                </p>
                <p className="mt-0.5 font-black text-slate-900">{solicitudId}</p>
              </div>
              <svg
                className="h-4 w-4 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          )}

          <p className="text-xs leading-relaxed text-slate-500">
            Tu solicitud de combustible fue enviada correctamente. Puedes
            seguir el estado desde tu historial de solicitudes.
          </p>
        </div>

        {/* Footer */}
        <div
          className={`space-y-2 border-t border-slate-100 px-6 py-5 transition-all delay-300 duration-300 ${
            show ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <button
            onClick={() => go("/dashboard")}
            className="w-full rounded-xl border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Ir al Dashboard
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => go("/mis-solicitudes")}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Mis solicitudes
            </button>
            <button
              onClick={handleReset}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ERROR EN CATÁLOGOS
// ══════════════════════════════════════════════════════════════════════════════

export function ErrorCatalogos({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="pb-10">
      <div className="rounded-3xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-100 bg-red-50">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-black text-slate-900">Error al cargar datos</h2>
          <p className="mt-2 text-sm font-semibold text-slate-400">{message}</p>
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
