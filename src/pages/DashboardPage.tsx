import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getRecentRequests,
} from "../services/dashboard.service";
import { cn } from "../lib/utils";
import { Clock, Zap, CheckCircle, FileText, Plus, ArrowRight, AlertTriangle, Truck } from "lucide-react";

// ─── Icons ─────────────────────────────────────────────────────────

const Icons = {
  Clock: () => <Clock size={19} strokeWidth={2} className="stroke-current" />,
  Lightning: () => <Zap size={19} strokeWidth={2} className="stroke-current" />,
  CheckCircle: () => <CheckCircle size={19} strokeWidth={2} className="stroke-current" />,
  Document: () => <FileText size={19} strokeWidth={2} className="stroke-current" />,
  Plus: () => <Plus size={14} strokeWidth={2.5} className="stroke-current" />,
  ArrowRight: () => <ArrowRight size={12} strokeWidth={2} />,
  Alert: () => <AlertTriangle size={15} color="#dc2626" strokeWidth={2} />,
  Truck: () => <Truck size={22} color="#94a3b8" strokeWidth={1.5} />,
};

// ─── Skeleton ────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-3.5 animate-pulse shadow-sm">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2.5">
          <div className="h-2.5 w-16 rounded bg-slate-200" />
          <div className="h-8 w-12 rounded bg-slate-300" />
        </div>
        <div className="w-10 h-10 rounded-lg bg-slate-100" />
      </div>
      <div className="h-2.5 w-20 rounded bg-slate-200" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[90, 110, 100, 72].map((w, i) => (
        <td key={i} className="p-4 border-b border-slate-100">
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
    classes += "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (s.includes("pend")) {
    classes += "bg-amber-50 text-amber-700 border-amber-200";
  } else if (s.includes("rechaz")) {
    classes += "bg-red-50 text-red-700 border-red-200";
  } else if (s.includes("progres") || s.includes("ejecu")) {
    classes += "bg-indigo-50 text-indigo-700 border-indigo-200";
  } else {
    classes += "bg-slate-50 text-slate-700 border-slate-200";
  }

  const dotClass = s.includes("aprob") || s.includes("aceptad") ? "bg-emerald-500" :
                   s.includes("pend") ? "bg-amber-500" :
                   s.includes("rechaz") ? "bg-red-500" :
                   s.includes("progres") || s.includes("ejecu") ? "bg-indigo-500" : "bg-slate-500";

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
        "relative bg-white border border-slate-200 rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-200 cursor-default",
        hovered ? "shadow-md -translate-y-0.5 border-slate-300" : "shadow-sm"
      )}
    >
      {/* Top color line on hover */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-transform duration-250 origin-left",
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
          <p className="text-2xs font-bold uppercase tracking-[0.07em] text-slate-500 mb-1.5">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-[-0.04em] leading-none">{value ?? 0}</p>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200",
          hovered ? accent.iconBg : "bg-slate-50"
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
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
        <Icons.Truck />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">Sin solicitudes recientes</p>
        <p className="text-xs text-slate-500 mt-1">Crea tu primera solicitud para comenzar.</p>
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

  const { data: summary, isLoading: loadingSummary, error: summaryError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
    staleTime: 60 * 1000,
  });

  const { data: recent = [], isLoading: loadingRecent, error: recentError } = useQuery({
    queryKey: ["dashboard-recent"],
    queryFn: getRecentRequests,
    staleTime: 60 * 1000,
  });

  const loading = loadingSummary || loadingRecent;
  const error = (summaryError as any)?.message || (recentError as any)?.message || null;

  const cards = useMemo(() => [
    {
      title: "Pendientes",
      value: summary?.pending ?? null,
      tag: "Por aprobar",
      accent: { bg: "bg-amber-50", iconBg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", line: "bg-amber-500" },
      icon: <Icons.Clock />,
    },
    {
      title: "En Progreso",
      value: summary?.in_progress ?? null,
      tag: "En proceso",
      accent: { bg: "bg-indigo-50", iconBg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-500", line: "bg-indigo-500" },
      icon: <Icons.Lightning />,
    },
    {
      title: "Aceptadas",
      value: summary?.accepted ?? null,
      tag: "Aprobadas",
      accent: { bg: "bg-emerald-50", iconBg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", line: "bg-emerald-500" },
      icon: <Icons.CheckCircle />,
    },
    {
      title: "Finalizadas",
      value: summary?.completed ?? null,
      tag: "Completadas",
      accent: { bg: "bg-slate-100", iconBg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-500", line: "bg-slate-500" },
      icon: <Icons.Document />,
    },
  ], [summary]);

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-7 gap-4">
          <div>
            <p className="text-2xs font-bold uppercase tracking-[0.08em] text-slate-500">
              Asamblea Legislativa · Transporte
            </p>
            <h1 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900 tracking-[-0.035em] leading-tight">
              Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
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
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-200 mb-6">
            <Icons.Alert />
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {cards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
        </div>

        {/* ── Recent Requests Table ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-[-0.02em]">Solicitudes recientes</h2>
              <p className="text-xs text-slate-500 mt-0.5">Últimas solicitudes registradas en el sistema</p>
            </div>
            {!loading && recent.length > 0 && (
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
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
                <tr className="bg-slate-50 border-b border-slate-100">
                  {(["Código", "Fecha", "Tipo", "Estado"] as const).map((h, i) => (
                    <th key={h} className={cn(
                      "text-2xs font-bold uppercase tracking-[0.07em] text-slate-500 p-3",
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
                    <tr key={r.code} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-120 last:border-b-0">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span className="text-sm font-semibold text-slate-900">{r.code}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-500">{r.date}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-900 font-medium">{r.type}</span>
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
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
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
