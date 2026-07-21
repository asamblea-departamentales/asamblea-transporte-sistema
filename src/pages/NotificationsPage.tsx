import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, type Notification, type NotiTipo, type NotiModulo } from "../notifications/NotificationContext";
import { getRequestDetailPath } from "../lib/requestIdentity";
import { timeAgo as formatTimeAgo } from "../lib/format";

// ─── Config visual ─────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<NotiTipo, { label: string; dot: string; bg: string; border: string }> = {
  aprobada:     { label: "Aprobada",     dot: "#10b981", bg: "rgba(16,185,129,.12)", border: "rgba(16,185,129,.25)" },
  pre_aprobada: { label: "Pre-Ap.",      dot: "#8b5cf6", bg: "rgba(139,92,246,.12)", border: "rgba(139,92,246,.25)" },
  asignada:     { label: "Asignada",     dot: "#06b6d4", bg: "rgba(6,182,212,.12)",  border: "rgba(6,182,212,.25)"  },
  programada:   { label: "Prog.",        dot: "#6366f1", bg: "rgba(99,102,241,.12)", border: "rgba(99,102,241,.25)" },
  rechazada:    { label: "Rechazada",    dot: "#ef4444", bg: "rgba(239,68,68,.12)",  border: "rgba(239,68,68,.25)"  },
  observada:    { label: "Observada",    dot: "#60a5fa", bg: "rgba(96,165,250,.12)", border: "rgba(96,165,250,.25)" },
  en_revision:  { label: "Revisión",     dot: "#f59e0b", bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.25)" },
  finalizada:   { label: "Finalizada",   dot: "#94a3b8", bg: "rgba(148,163,184,.12)",border: "rgba(148,163,184,.25)"},
  cancelada:    { label: "Cancelada",    dot: "#64748b", bg: "rgba(100,116,139,.12)",border: "rgba(100,116,139,.2)" },
  recordatorio: { label: "Recordatorio", dot: "#fbbf24", bg: "rgba(251,191,36,.12)", border: "rgba(251,191,36,.25)" },
  info:         { label: "Info",         dot: "#3b82f6", bg: "rgba(59,130,246,.12)",  border: "rgba(59,130,246,.2)"  },
};

const MODULO_CONFIG: Record<NotiModulo, { label: string; icon: React.ReactNode }> = {
  transporte: {
    label: "Transporte",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6.5 15.5h11M7.5 6.5h9l1.6 4.8c.26.78.4 1.6.4 2.42V17a2 2 0 01-2 2h-.5a2 2 0 01-4 0h-4a2 2 0 01-4 0H5a2 2 0 01-2-2v-3.28c0-.82.14-1.64.4-2.42L5 6.5h2.5Z" strokeLinejoin="round"/>
        <path d="M6 11.5h12" strokeLinecap="round"/>
      </svg>
    ),
  },
  mantenimiento: {
    label: "Mantenimiento",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-7 7-4-4 7-7 4 4Z" strokeLinejoin="round"/>
        <path d="M3 21l6-2 10-10-4-4L5 15l-2 6Z" strokeLinejoin="round"/>
      </svg>
    ),
  },
  combustible: {
    label: "Combustible",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h8v18H7V3Z" strokeLinejoin="round"/>
        <path d="M15 7h2l2 2v10a2 2 0 01-2 2h-2" strokeLinejoin="round"/>
        <path d="M9 7h4" strokeLinecap="round"/>
      </svg>
    ),
  },
};

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllRead, permission, requestPermission } = useNotifications();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"todas" | "no_leidas" | NotiTipo>("todas");

  const filtered = notifications.filter((n) => {
    if (filter === "todas")      return true;
    if (filter === "no_leidas")  return !n.leida;
    return n.tipo === filter;
  });

  const FILTROS: { value: typeof filter; label: string }[] = [
    { value: "todas",        label: "Todas" },
    { value: "no_leidas",    label: "No leídas" },
    { value: "aprobada",     label: "Aprobadas" },
    { value: "rechazada",    label: "Rechazadas" },
    { value: "recordatorio", label: "Recordatorios" },
    { value: "observada",    label: "Observadas" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-10">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Notificaciones
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0
              ? `${unreadCount} sin leer`
              : "Todo al día"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Marcar todo leído
          </button>
        )}
      </div>

      {/* Permission Prompt (Mobile Friendly) */}
      {permission === "default" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-blue-600 p-6 text-white shadow-xl shadow-blue-200">
          <div className="flex items-center gap-4 text-left w-full">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 flex-shrink-0">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">Activar Notificaciones</h3>
              <p className="text-sm text-blue-100">Recibe alertas instantáneas en tu celular o PC.</p>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="w-full sm:w-auto rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-blue-600 shadow-lg transition hover:scale-105 active:scale-95 flex-shrink-0"
          >
            Habilitar ahora
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              filter === f.value
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin notificaciones</p>
            <p className="text-xs text-slate-400">
              {filter === "todas" ? "Cuando haya actividad en tus solicitudes aparecerá aquí." : "No hay notificaciones con este filtro."}
            </p>
          </div>
        ) : (
          filtered.map((n: Notification) => {
            const cfg = TIPO_CONFIG[n.tipo];
            const mod = MODULO_CONFIG[n.modulo];
            return (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.leida) markAsRead(n.id);
                  navigate(getRequestDetailPath({ modulo: n.modulo, id: n.reqId, codigo: n.codigo }));
                }}
                className={`group w-full rounded-2xl border bg-white text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99] ${
                  n.leida ? "border-slate-100 opacity-60" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4 px-5 py-4">
                  {/* Dot de tipo */}
                  <div
                    className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }}
                    />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm ${n.leida ? "font-medium text-slate-500" : "font-bold text-slate-900"}`}>
                        {n.titulo}
                      </span>
                      {/* Badge módulo */}
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {mod.icon}
                        {mod.label}
                      </span>
                      {/* Badge tipo */}
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                        style={{ background: cfg.bg, color: cfg.dot }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">{n.mensaje}</p>

                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {formatTimeAgo(n.createdAt, "Hace un momento")}
                    </p>
                  </div>

                  {/* Indicador no leída */}
                  {!n.leida && (
                    <div
                      className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"
                      style={{ boxShadow: "0 0 8px rgba(59,130,246,0.7)" }}
                    />
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}