// src/notifications/NotificationToast.tsx
import { useEffect, useRef, useState } from "react";
import { useNotifications, type NotiTipo } from "./NotificationContext";

// ─── Config visual por tipo ───────────────────────────────────────────────────
// Adaptado al tema institucional light — no dark

const toastCfg: Record<NotiTipo, { dot: string; bg: string; border: string; label: string }> = {
  aprobada:     { dot: "bg-emerald-500", bg: "bg-emerald-50",  border: "border-emerald-200", label: "Aprobada"     },
  rechazada:    { dot: "bg-red-500",     bg: "bg-red-50",      border: "border-red-200",     label: "Rechazada"    },
  observada:    { dot: "bg-blue-500",    bg: "bg-blue-50",     border: "border-blue-200",    label: "Observada"    },
  finalizada:   { dot: "bg-slate-400",   bg: "bg-slate-50",    border: "border-slate-200",   label: "Finalizada"   },
  recordatorio: { dot: "bg-amber-500",   bg: "bg-amber-50",    border: "border-amber-200",   label: "Recordatorio" },
  info:         { dot: "bg-blue-400",    bg: "bg-blue-50",     border: "border-blue-200",    label: "Info"         },
};

// ─── Barra de progreso ────────────────────────────────────────────────────────

function ProgressBar({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden rounded-b-xl">
      <div
        className={`h-full transition-all ease-linear ${color}`}
        style={{
          width: active ? "0%" : "100%",
          transitionDuration: active ? "4700ms" : "0ms",
          opacity: 0.6,
        }}
      />
    </div>
  );
}

// ─── Toast individual ─────────────────────────────────────────────────────────

function ToastItem({ onDone }: { onDone: () => void }) {
  const { toast } = useNotifications();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;

    // Entrada
    const t1 = setTimeout(() => { setVisible(true); }, 30);
    // Barra de progreso arranca un tick después de la entrada
    const t2 = setTimeout(() => setProgress(true), 60);
    // Salida
    const t3 = setTimeout(() => {
      setVisible(false);
      setProgress(false);
      timerRef.current = setTimeout(onDone, 350);
    }, 5000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [toast, onDone]);

  const handleClose = () => {
    setVisible(false);
    setProgress(false);
    timerRef.current = setTimeout(onDone, 350);
  };

  if (!toast) return null;
  const cfg = toastCfg[toast.tipo];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3
        w-80 rounded-xl border bg-white shadow-[0_8px_30px_rgba(15,37,72,0.12),0_2px_8px_rgba(15,37,72,0.06)]
        px-4 py-3.5
        transition-all duration-350
        ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"}
        ${cfg.border}
      `}
    >
      {/* Icono tipo */}
      <div className={`mt-0.5 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg border ${cfg.bg} ${cfg.border}`}>
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12px] font-bold text-slate-900 truncate">{toast.titulo}</p>
          <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.border}`}
            style={{ color: "inherit" }}>
            {cfg.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{toast.mensaje}</p>
      </div>

      {/* Cerrar */}
      <button
        onClick={handleClose}
        aria-label="Cerrar notificación"
        className="flex-shrink-0 mt-0.5 text-slate-300 hover:text-slate-500 transition-colors"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Barra progreso */}
      <ProgressBar active={progress} color={cfg.dot} />
    </div>
  );
}

// ─── Wrapper global ───────────────────────────────────────────────────────────

export default function NotificationToast() {
  const { toast, clearToast } = useNotifications();
  if (!toast) return null;

  return (
    // En móvil: sobre el bottom nav (bottom-[76px])
    // En desktop: esquina inferior derecha estándar
    <div className="fixed bottom-[76px] right-4 z-[200] lg:bottom-6 lg:right-6">
      <ToastItem onDone={clearToast} />
    </div>
  );
}