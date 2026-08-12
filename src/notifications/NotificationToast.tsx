import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type NotiTipo } from "./NotificationContext";
import { getNotificationTargetPath } from "./notification-routing";

const toastCfg: Record<NotiTipo, { dot: string; bg: string; border: string; label: string }> = {
  aprobada: { dot: "bg-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", label: "Aprobada" },
  pre_aprobada: { dot: "bg-violet-500", bg: "bg-violet-50", border: "border-violet-200", label: "Pre-Ap." },
  asignada: { dot: "bg-cyan-500", bg: "bg-cyan-50", border: "border-cyan-200", label: "Asignada" },
  programada: { dot: "bg-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", label: "Prog." },
  rechazada: { dot: "bg-red-500", bg: "bg-red-50", border: "border-red-200", label: "Rechazada" },
  observada: { dot: "bg-blue-500", bg: "bg-blue-50", border: "border-blue-200", label: "Observada" },
  en_revision: { dot: "bg-amber-400", bg: "bg-amber-50", border: "border-amber-200", label: "Revisión" },
  finalizada: { dot: "bg-slate-400", bg: "bg-slate-50", border: "border-slate-200", label: "Finalizada" },
  cancelada: { dot: "bg-slate-300", bg: "bg-slate-50", border: "border-slate-100", label: "Cancelada" },
  recordatorio: { dot: "bg-amber-500", bg: "bg-amber-50", border: "border-amber-200", label: "Aviso" },
  info: { dot: "bg-blue-400", bg: "bg-blue-50", border: "border-blue-200", label: "Info" },
};

function ToastItem({ onDone }: { onDone: () => void }) {
  const { toast, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!toast) return;
    const enter = setTimeout(() => setVisible(true), 30);
    const progressTimer = setTimeout(() => setProgress(true), 60);
    const exit = setTimeout(() => {
      setVisible(false);
      setProgress(false);
      timerRef.current = setTimeout(onDone, 350);
    }, 5000);
    return () => { clearTimeout(enter); clearTimeout(progressTimer); clearTimeout(exit); };
  }, [toast, onDone]);

  if (!toast) return null;
  const cfg = toastCfg[toast.tipo] ?? toastCfg.info;

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setVisible(false);
    setProgress(false);
    timerRef.current = setTimeout(onDone, 350);
  };

  const handleNavigate = async () => {
    await markAsRead(toast.id);
    navigate(getNotificationTargetPath({ modulo: toast.modulo, solicitudId: toast.reqId, url: toast.url }));
    handleClose();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Abrir notificación ${toast.titulo}`}
      onClick={() => void handleNavigate()}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); void handleNavigate(); } }}
      className={`relative flex w-80 cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-[0_8px_30px_rgba(15,37,72,0.12),0_2px_8px_rgba(15,37,72,0.06)] transition-all duration-350 hover:shadow-[0_12px_40px_rgba(15,37,72,0.18)] ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"} ${cfg.border}`}
    >
      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${cfg.bg} ${cfg.border}`}><span className={`h-2 w-2 rounded-full ${cfg.dot}`} /></div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="mb-0.5 flex items-center gap-2"><p className="truncate text-[12px] font-bold text-slate-900">{toast.titulo}</p><span className={`flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${cfg.bg} ${cfg.border}`}>{cfg.label}</span></div>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-500">{toast.mensaje}</p>
      </div>
      <button onClick={handleClose} aria-label="Cerrar notificación" className="mt-0.5 flex-shrink-0 text-slate-300 transition-colors hover:text-slate-500">×</button>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] overflow-hidden rounded-b-xl"><div className={`h-full transition-all ease-linear ${cfg.dot}`} style={{ width: progress ? "0%" : "100%", transitionDuration: progress ? "4700ms" : "0ms", opacity: 0.6 }} /></div>
    </div>
  );
}

export default function NotificationToast() {
  const { toast, clearToast } = useNotifications();
  if (!toast) return null;
  return <div className="fixed bottom-[76px] right-4 z-[200] lg:bottom-6 lg:right-6"><ToastItem onDone={clearToast} /></div>;
}
