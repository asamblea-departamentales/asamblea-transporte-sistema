// src/components/transport/SuccessScreen.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  solicitudId?: string;
};

export default function SuccessScreen({ solicitudId }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function go(path: string) {
    setVisible(false);
    setTimeout(() => navigate(path), 300);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(15,23,42,0.55)",
        backdropFilter:  "blur(6px)",
        transition:      "opacity 300ms ease",
        opacity:         visible ? 1 : 0,
      }}
    >
      <div
        style={{
          transition: "opacity 300ms ease, transform 350ms cubic-bezier(.34,1.4,.64,1)",
          opacity:    visible ? 1 : 0,
          transform:  visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.96)",
        }}
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/60"
      >
        {/* Contenido */}
        <div className="flex flex-col items-center px-8 pb-6 pt-10 text-center">
          {/* Check */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
            <svg
              className="h-7 w-7 text-slate-800"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2.5}
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
                style={{
                  strokeDasharray:  "28",
                  strokeDashoffset: visible ? "0" : "28",
                  transition:       "stroke-dashoffset 450ms 150ms ease",
                }}
              />
            </svg>
          </div>

          <h2 className="text-xl font-black tracking-tight text-slate-900">
            Solicitud enviada
          </h2>

          {solicitudId && (
            <div className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Código</p>
              <p className="mt-0.5 text-base font-black text-slate-900">{solicitudId}</p>
            </div>
          )}

          <p className="mt-4 text-xs font-medium leading-relaxed text-slate-500">
            Tu supervisor recibirá la solicitud para revisión y aprobación.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-2.5 border-t border-slate-100 px-6 py-5">
          <button
            onClick={() => go("/dashboard")}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Ir al Dashboard
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => go("/mis-solicitudes")}
              className="rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Mis solicitudes
            </button>
            <button
              onClick={() => go("/solicitudes/nueva")}
              className="rounded-2xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              Nueva solicitud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}