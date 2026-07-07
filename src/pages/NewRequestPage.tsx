// src/pages/NewRequestPage.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { cn } from "../lib/utils"; 



export type ModuleKey   = "transporte" | "combustible" | "mantenimiento";
export type AccentColor = "blue" | "amber" | "emerald";

export type ModuleCard = {
  key:          ModuleKey;
  title:        string;
  description:  string;
  href:         string;
  accent:       AccentColor;
  icon:         React.ReactNode;
  allowedRoles: string[];
};

// ─── Accent config ────────────────────────────────────────────────────────────
// Un solo objeto en lugar de ternarios repetidos en 3 componentes
// Mueve esto a src/config/accent.config.ts cuando el proyecto crezca

const accent = {
  blue: {
    icon:         "bg-blue-50 border border-blue-100 text-blue-600",
    badge:        "bg-blue-50 border border-blue-100 text-blue-800",
    dot:          "bg-blue-400",
    cta:          "text-blue-700",
    ctaArrow:     "bg-blue-100 text-blue-600",
    cardHover:    "hover:border-blue-200",
    topLine:      "from-blue-400 to-blue-200",
  },
  amber: {
    icon:         "bg-amber-50 border border-amber-100 text-amber-600",
    badge:        "bg-amber-50 border border-amber-100 text-amber-800",
    dot:          "bg-amber-400",
    cta:          "text-amber-800",
    ctaArrow:     "bg-amber-100 text-amber-700",
    cardHover:    "hover:border-amber-200",
    topLine:      "from-amber-400 to-amber-200",
  },
  emerald: {
    icon:         "bg-emerald-50 border border-emerald-100 text-emerald-600",
    badge:        "bg-emerald-50 border border-emerald-100 text-emerald-800",
    dot:          "bg-emerald-400",
    cta:          "text-emerald-800",
    ctaArrow:     "bg-emerald-100 text-emerald-700",
    cardHover:    "hover:border-emerald-200",
    topLine:      "from-emerald-400 to-emerald-200",
  },
} satisfies Record<AccentColor, Record<string, string>>;

// ─── Module definitions ───────────────────────────────────────────────────────
// Datos estáticos → fuera del componente, sin useMemo
// Mueve a src/config/modules.config.tsx cuando el proyecto crezca

const MODULE_DEFINITIONS: ModuleCard[] = [
  {
    key:         "transporte",
    title:       "Transporte",
    description: "Solicitudes de transporte institucional, asignación de vehículos y seguimiento en tiempo real.",
    href:        "/solicitudes/transporte/paso-1",
    accent:      "blue",
    allowedRoles: ["solicitante", "admin", "supervisor", "jefe"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M6.5 15.5h11M7.5 6.5h9l1.6 4.8c.26.78.4 1.6.4 2.42V17a2 2 0 0 1-2 2h-.5a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H5a2 2 0 0 1-2-2v-3.28c0-.82.14-1.64.4-2.42L5 6.5h2.5Z" strokeLinejoin="round" />
        <path d="M6 11.5h12" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key:         "combustible",
    title:       "Combustible",
    description: "Solicitudes de combustible, control de consumo y validación de entregas institucionales.",
    href:        "/solicitudes/combustible/nueva",
    accent:      "amber",
    allowedRoles: ["admin", "supervisor", "jefe"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M7 3h8v18H7V3Z" strokeLinejoin="round" />
        <path d="M15 7h2l2 2v10a2 2 0 0 1-2 2h-2" strokeLinejoin="round" />
        <path d="M9 7h4" strokeLinecap="round" />
        <path d="M9 11h4" strokeLinecap="round" opacity="0.7" />
      </svg>
    ),
  },
  {
    key:         "mantenimiento",
    title:       "Mantenimiento",
    description: "Registro de mantenimientos preventivos y correctivos, historial completo y control de aprobaciones.",
    href:        "/solicitudes/mantenimiento/nueva",
    accent:      "emerald",
    allowedRoles: ["admin", "supervisor", "jefe"],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 7l-7 7-4-4 7-7 4 4Z" strokeLinejoin="round" />
        <path d="M3 21l6-2 10-10-4-4L5 15l-2 6Z" strokeLinejoin="round" />
        <path d="M14 6l4 4" strokeLinecap="round" opacity="0.75" />
      </svg>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModuleCardItem({ card, index }: { card: ModuleCard; index: number }) {
  const navigate = useNavigate();
  const cfg = accent[card.accent];

  return (
    <button
      onClick={() => navigate(card.href)}
      className={cn(
        // Base
        "group relative w-full text-left",
        "bg-white rounded-2xl border border-slate-200",
        "p-5 sm:p-6",
        "shadow-[0_2px_8px_rgba(15,23,42,.05),0_0_0_1px_rgba(15,23,42,.03)]",
        // Hover
        "transition-all duration-300",
        "hover:-translate-y-0.5",
        "hover:shadow-[0_12px_32px_rgba(15,23,42,.09),0_2px_8px_rgba(15,23,42,.04)]",
        cfg.cardHover,
        // Focus
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2",
        // Active
        "active:scale-[0.99]",
      )}
      // Entrada escalonada con animation-delay
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Línea superior de color — solo visible en hover */}
      <div
        className={cn(
          "absolute top-0 left-6 right-6 h-[2px] rounded-b-sm",
          "bg-gradient-to-r opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300",
          cfg.topLine,
        )}
      />

      {/* Top row: icono + badge */}
      <div className="flex items-start justify-between mb-5">
        <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-[1.05] group-hover:-rotate-1", cfg.icon)}>
          {card.icon}
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold", cfg.badge)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
          Disponible
        </span>
      </div>

      {/* Título */}
      <h3 className="text-[1.05rem] font-bold tracking-tight text-slate-900 mb-2 leading-snug">
        {card.title}
      </h3>

      {/* Descripción */}
      <p className="text-[0.8rem] text-slate-500 leading-relaxed font-normal mb-5">
        {card.description}
      </p>

      {/* Divider */}
      <div className="h-px bg-slate-100 mb-4" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-2 text-[0.78rem] font-bold transition-all duration-200", cfg.cta)}>
          Iniciar solicitud
          <span className={cn("flex items-center justify-center w-5 h-5 rounded-md transition-transform duration-200 group-hover:translate-x-0.5", cfg.ctaArrow)}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </span>
        <span className="text-[0.68rem] font-semibold text-slate-300 uppercase tracking-wider">
          Por rol
        </span>
      </div>
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">Sin módulos disponibles</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
        No tienes permisos para acceder a ningún módulo. Contacta al administrador del sistema.
      </p>
      <button
        onClick={() => navigate("/dashboard")}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-sm hover:opacity-90 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al Dashboard
      </button>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function NewRequestPage() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const userRoles   = user?.roles ?? [];

  const visibleModules = useMemo(
    () => MODULE_DEFINITIONS.filter(m => {
      // Si es super admin o admin informático, siempre puede ver todos los módulos
      if (userRoles.some(r => ["admin", "superadmin", "super_admin"].includes(r.toLowerCase()))) {
        return true;
      }
      // Si el usuario tiene unidad asignada, verifica los permisos dinámicos de esa unidad
      if (user?.unidad) {
        return user.unidad[m.key] === true;
      }
      // Fallback a roles quemados por si acaso el usuario no tiene unidad configurada
      return m.allowedRoles.some(r => userRoles.includes(r));
    }),
    [userRoles, user?.unidad],
  );

  const gridCols =
    visibleModules.length === 1 ? "grid-cols-1 max-w-sm mx-auto" :
    visibleModules.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
                                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-widest text-blue-600">
            <span className="inline-block w-4 h-[2px] bg-blue-600 rounded-full" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Nueva Solicitud
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md">
            Seleccione el módulo correspondiente para iniciar su solicitud institucional.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="group inline-flex items-center gap-2 self-start px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-900 hover:shadow-md active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
        >
          <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al inicio
        </button>
      </div>

      

      {/* ── Section label ── */}
      <div className="flex items-center gap-3">
        <span className="text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">
          Módulos disponibles
        </span>
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[0.68rem] font-semibold text-slate-400">
          {visibleModules.length} módulo{visibleModules.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Cards ── */}
      {visibleModules.length > 0 ? (
        <div className={cn("grid gap-4", gridCols)}>
          {visibleModules.map((m, i) => (
            <ModuleCardItem key={m.key} card={m} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

    </div>
  );
}