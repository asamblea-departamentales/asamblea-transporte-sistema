// src/notifications/NotificationToast.tsx
import { useEffect, useState } from "react";
import { useNotifications, type NotiTipo } from "./NotificationContext";

const DOT: Record<NotiTipo, string> = {
  aprobada:     "#10b981",
  rechazada:    "#ef4444",
  observada:    "#60a5fa",
  finalizada:   "#94a3b8",
  recordatorio: "#fbbf24",
  info:         "#93c5fd",
};

function Toast({ onDone }: { onDone: () => void }) {
  const { toast } = useNotifications();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t1 = setTimeout(() => setVisible(true), 30);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast, onDone]);

  if (!toast) return null;
  const color = DOT[toast.tipo];

  return (
    <div
      className={`flex items-start gap-3 w-80 rounded-2xl border border-white/10 bg-[rgba(7,11,22,0.97)] px-4 py-3.5 shadow-2xl transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {/* Dot tipo */}
      <div
        className="mt-0.5 h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-xl border"
        style={{ background: `${color}18`, borderColor: `${color}40` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white truncate">{toast.titulo}</p>
        <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">{toast.mensaje}</p>
      </div>

      {/* Cerrar */}
      <button
        onClick={() => { setVisible(false); setTimeout(onDone, 300); }}
        className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0 mt-0.5"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Barra progreso */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-2xl">
        <div
          className="h-full transition-all ease-linear"
          style={{
            background: color,
            opacity: 0.5,
            width: visible ? "0%" : "100%",
            transitionDuration: "5000ms",
          }}
        />
      </div>
    </div>
  );
}

export default function NotificationToast() {
  const { toast, clearToast } = useNotifications();
  if (!toast) return null;
  return (
    <div className="fixed bottom-24 right-4 z-[200] lg:bottom-6">
      <Toast onDone={clearToast} />
    </div>
  );
}