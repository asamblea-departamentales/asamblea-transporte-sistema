// src/components/transport/SuccessScreen.tsx
// Pantalla de éxito con animaciones CSS puras (sin librerías externas)
// Se muestra como overlay full-screen tras enviar la solicitud

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  solicitudId?: string;
  onClose?: () => void;
};

export default function SuccessScreen({ solicitudId, onClose }: Props) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Entrada con pequeño delay para que el CSS transition arranque
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function exit(cb: () => void) {
    setLeaving(true);
    setTimeout(() => {
      cb();
      onClose?.();
    }, 420);
  }

  function goHome()        { exit(() => navigate("/dashboard")); }
  function goHistorial()   { exit(() => navigate("/mis-solicitudes")); }
  function goNueva()       { exit(() => navigate("/solicitudes/nueva")); }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        transition: "opacity 400ms cubic-bezier(.4,0,.2,1), transform 400ms cubic-bezier(.4,0,.2,1)",
        opacity:    leaving ? 0 : visible ? 1 : 0,
        transform:  leaving ? "scale(1.04)" : visible ? "scale(1)" : "scale(0.97)",
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" />

      {/* Partículas decorativas */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width:      `${6 + (i % 4) * 4}px`,
              height:     `${6 + (i % 4) * 4}px`,
              background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#34d399" : "#fbbf24",
              opacity:    visible && !leaving ? 0.35 : 0,
              top:        `${10 + (i * 7) % 80}%`,
              left:       `${5 + (i * 11) % 90}%`,
              transition: `opacity 800ms ${100 + i * 60}ms ease, transform 1200ms ${100 + i * 60}ms ease`,
              transform:  visible && !leaving
                ? `translateY(${i % 2 === 0 ? "-24px" : "24px"}) rotate(${i * 30}deg)`
                : "translateY(0) rotate(0deg)",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        className="relative mx-4 w-full max-w-md"
        style={{
          transition: "opacity 420ms 60ms ease, transform 420ms 60ms cubic-bezier(.34,1.56,.64,1)",
          opacity:    leaving ? 0 : visible ? 1 : 0,
          transform:  leaving ? "translateY(16px)" : visible ? "translateY(0)" : "translateY(32px)",
        }}
      >
        <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200/60">

          {/* Header verde con check animado */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 px-8 py-10 text-center">
            {/* Glow */}
            <div className="pointer-events-none absolute -top-10 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-white/20 blur-2xl" />

            {/* Círculo check */}
            <div
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30"
              style={{
                transition: "transform 600ms 200ms cubic-bezier(.34,1.56,.64,1), opacity 400ms 200ms ease",
                opacity:    visible ? 1 : 0,
                transform:  visible ? "scale(1)" : "scale(0.4)",
              }}
            >
              {/* SVG Check con stroke-dasharray animado */}
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path
                  d="M5 13l4 4L19 7"
                  style={{
                    strokeDasharray:  "24",
                    strokeDashoffset: visible ? "0" : "24",
                    transition:       "stroke-dashoffset 500ms 500ms cubic-bezier(.4,0,.2,1)",
                  }}
                />
              </svg>
            </div>

            <h2
              className="mt-5 text-2xl font-black text-white"
              style={{
                transition: "opacity 500ms 350ms ease, transform 500ms 350ms ease",
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(8px)",
              }}
            >
              ¡Solicitud enviada!
            </h2>

            <p
              className="mt-1.5 text-sm font-medium text-emerald-100"
              style={{
                transition: "opacity 500ms 440ms ease, transform 500ms 440ms ease",
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(8px)",
              }}
            >
              Tu solicitud fue registrada exitosamente.
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-6 space-y-5">

            {/* ID de solicitud */}
            {solicitudId && (
              <div
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5"
                style={{
                  transition: "opacity 400ms 520ms ease, transform 400ms 520ms ease",
                  opacity:    visible ? 1 : 0,
                  transform:  visible ? "translateY(0)" : "translateY(10px)",
                }}
              >
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                    Código de solicitud
                  </p>
                  <p className="mt-0.5 text-lg font-black tracking-tight text-slate-900">
                    {solicitudId}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Info de próximos pasos */}
            <div
              className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5 text-sm text-blue-800"
              style={{
                transition: "opacity 400ms 600ms ease, transform 400ms 600ms ease",
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <p className="font-bold text-blue-900">¿Qué sigue?</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-blue-700">
                Tu supervisor recibirá la solicitud para revisión y aprobación. Recibirás una notificación cuando haya una actualización.
              </p>
            </div>

            {/* Acciones */}
            <div
              className="space-y-2.5"
              style={{
                transition: "opacity 400ms 680ms ease, transform 400ms 680ms ease",
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              {/* Botón principal */}
              <button
                onClick={goHome}
                className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <span className="relative flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Ir al Dashboard
                </span>
              </button>

              {/* Secundarios */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={goHistorial}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.98]"
                >
                  <svg className="h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Mis solicitudes
                </button>
                <button
                  onClick={goNueva}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-[0.98]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva solicitud
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}