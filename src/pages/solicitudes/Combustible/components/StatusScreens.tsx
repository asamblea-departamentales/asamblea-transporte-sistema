import { useNavigate } from "react-router-dom";

// ══════════════════════════════════════════════════════════════════════════════
// PANTALLA DE ÉXITO
// ══════════════════════════════════════════════════════════════════════════════

export function SuccessScreen({ onReset }: { onReset: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 shadow-xl shadow-slate-900/10">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">¡Solicitud enviada!</h2>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            Tu solicitud de combustible fue enviada correctamente y está pendiente de aprobación.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/solicitudes/combustible")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
            >
              Ver mis solicitudes
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
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
