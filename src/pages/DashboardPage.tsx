import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  getRecentRequests,
  type DashboardSummary,
  type RecentRequest,
} from "../services/dashboard.service";
import { cn } from "../lib/utils";

// ─── Icons ─────────────────────────────────────────────────────────

const Icons = {
  Clock: () => (
    <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Lightning: () => (
    <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Document: () => (
    <svg width={19} height={19} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Plus: () => (
    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} className="stroke-current">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width={12} height={12} fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  ),
  Alert: () => (
    <svg width={15} height={15} fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Truck: () => (
    <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

// ─── Skeleton ────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-card p-6 flex flex-col gap-3.5 animate-pulse">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="h-2.5 w-16 rounded bg-slate-200" />
          <div className="h-8 w-12 rounded bg-slate-300" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-200" />
      </div>
      <div className="h-2.5 w-20 rounded bg-slate-200" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[90, 110, 100, 72].map((w, i) => (
        <td key={i} className="p-4 border-b border-surface-border">
          <div className="h-3 rounded bg-slate-200" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Status Badge (usa tokens del tailwind.config.js) ───────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let classes = "inline-flex items-center gap-1.5 px-3 py-1 rounded-badge text-xs font-semibold border ";
  
  if (s.includes("aprob") || s.includes("aceptad") || s.includes("pre_apro")) {
    classes += "bg-noti-approved-bg text-noti-approved-dot border-noti-approved-border";
  } else if (s.includes("pend")) {
    classes += "bg-noti-info-bg text-noti-info-dot border-noti-info-border";
  } else if (s.includes("rechaz")) {
    classes += "bg-noti-rejected-bg text-noti-rejected-dot border-noti-rejected-border";
  } else if (s.includes("progres")) {
    classes += "bg-blue-glass text-blue-solid border-blue-border";
  } else {
    classes += "bg-noti-done-bg text-noti-done-dot border-noti-done-border";
  }

  const dotClass = s.includes("aprob") || s.includes("aceptad") ? "bg-noti-approved-dot" :
                   s.includes("pend") ? "bg-noti-info-dot" :
                   s.includes("rechaz") ? "bg-noti-rejected-dot" :
                   s.includes("progres") ? "bg-blue-solid" : "bg-noti-done-dot";

  return (
    <span className={classes}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />
      {status}
    </span>
  );
}

// ─── Stat Card (usa tokens y sombras de tailwind.config.js) ────────

function StatCard({ title, value, tag, icon, accent, loading }: {
  title: string; value: number | null; tag: string;
  icon: React.ReactNode;
  accent: { bg: string; iconBg: string; text: string; dot: string; line: string };
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  if (loading) return <SkeletonCard />;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative bg-surface-card border border-surface-border rounded-card p-6 flex flex-col overflow-hidden transition-all duration-200 cursor-default",
        hovered ? "shadow-card -translate-y-0.5 border-surface-border-strong" : "shadow-none"
      )}
    >
      {/* Top color line on hover */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] rounded-t-card transition-transform duration-250 origin-left",
        accent.line,
        hovered ? "scale-x-100" : "scale-x-0"
      )} />

      {/* Corner glow */}
      <div className={cn(
        "absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none transition-opacity duration-250",
        accent.bg,
        hovered ? "opacity-20" : "opacity-0"
      )} />

      {/* Content */}
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <p className="text-2xs font-bold uppercase tracking-[0.07em] text-ink-muted mb-1.5">{title}</p>
          <p className="text-3xl font-extrabold text-ink-primary tracking-[-0.04em] leading-none">{value ?? 0}</p>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200",
          hovered ? accent.iconBg : "bg-surface-subtle"
        )}>
          {icon}
        </div>
      </div>

      <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", accent.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", accent.dot)} />
        {tag}
      </span>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────

function EmptyState({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14">
      <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center">
        <Icons.Truck />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-ink-primary">Sin solicitudes recientes</p>
        <p className="text-xs text-ink-muted mt-1">Crea tu primera solicitud para comenzar.</p>
      </div>
      <button
        onClick={onNewRequest}
        className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-asamblea text-white text-xs font-semibold hover:bg-asamblea/90 transition-all active:scale-95"
      >
        <Icons.Plus />
        Nueva solicitud
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const [s, r] = await Promise.all([getDashboardSummary(), getRecentRequests()]);
        if (!alive) return;
        setSummary(s); setRecent(r);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar el dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const cards = useMemo(() => [
    {
      title: "Pendientes",
      value: summary?.pending ?? null,
      tag: "Por aprobar",
      accent: { bg: "bg-noti-info-bg", iconBg: "bg-noti-info-bg", text: "text-noti-info-dot", dot: "bg-noti-info-dot", line: "bg-noti-info-dot" },
      icon: <Icons.Clock />,
    },
    {
      title: "En Progreso",
      value: summary?.in_progress ?? null,
      tag: "En proceso",
      accent: { bg: "bg-blue-glass", iconBg: "bg-blue-glass", text: "text-blue-solid", dot: "bg-blue-solid", line: "bg-blue-solid" },
      icon: <Icons.Lightning />,
    },
    {
      title: "Aceptadas",
      value: summary?.accepted ?? null,
      tag: "Aprobadas",
      accent: { bg: "bg-noti-approved-bg", iconBg: "bg-noti-approved-bg", text: "text-noti-approved-dot", dot: "bg-noti-approved-dot", line: "bg-noti-approved-dot" },
      icon: <Icons.CheckCircle />,
    },
    {
      title: "Finalizadas",
      value: summary?.completed ?? null,
      tag: "Completadas",
      accent: { bg: "bg-noti-done-bg", iconBg: "bg-noti-done-bg", text: "text-noti-done-dot", dot: "bg-noti-done-dot", line: "bg-noti-done-dot" },
      icon: <Icons.Document />,
    },
  ], [summary]);

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-7 gap-4">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.08em] text-ink-muted">
              Asamblea Legislativa · Transporte
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-ink-primary tracking-[-0.035em] leading-tight">
              Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-ink-secondary">
              Resumen general de solicitudes de transporte
            </p>
          </div>

          <button
            onClick={() => navigate("/nueva-solicitud")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold shadow-blue-glow hover:bg-blue-glass-hover focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all active:scale-95 flex-shrink-0"
          >
            <Icons.Plus />
            Nueva solicitud
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-noti-rejected-bg border border-noti-rejected-border mb-6">
            <Icons.Alert />
            <p className="text-sm font-medium text-noti-rejected-dot">{error}</p>
          </div>
        )}

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {cards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
        </div>

        {/* ── Recent Requests Table ── */}
        <div className="bg-surface-card border border-surface-border rounded-card overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <div>
              <h2 className="text-base font-bold text-ink-primary tracking-[-0.02em]">Solicitudes recientes</h2>
              <p className="text-xs text-ink-muted mt-0.5">Últimas solicitudes registradas en el sistema</p>
            </div>
            {!loading && recent.length > 0 && (
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-subtle transition-all active:scale-95"
              >
                Ver todas
                <Icons.ArrowRight />
              </button>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-surface-border">
                  {(["Código", "Fecha", "Tipo", "Estado"] as const).map((h, i) => (
                    <th key={h} className={cn(
                      "text-2xs font-bold uppercase tracking-[0.07em] text-ink-muted p-3",
                      i === 3 ? "text-right" : "text-left"
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>{[1,2,3].map(i => <SkeletonRow key={i} />)}</>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState onNewRequest={() => navigate("/nueva-solicitud")} />
                    </td>
                  </tr>
                ) : (
                  recent.map(r => (
                    <tr key={r.code} className="border-b border-surface-border hover:bg-surface-subtle transition-colors duration-120 last:border-b-0">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-solid flex-shrink-0" />
                          <span className="text-sm font-semibold text-ink-primary">{r.code}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-ink-secondary">{r.date}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-ink-primary font-medium">{r.type}</span>
                      </td>
                      <td className="p-4 text-right">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && recent.length > 0 && (
            <div className="p-4 border-t border-surface-border">
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-surface-border text-xs font-semibold text-ink-primary hover:bg-surface-subtle transition-all active:scale-95"
              >
                Ver todas las solicitudes
                <Icons.ArrowRight />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
