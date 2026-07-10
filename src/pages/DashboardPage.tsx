import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getRecentRequests,
} from "../services/dashboard.service";
import { cn } from "../lib/utils";
import { 
  Clock, Zap, CheckCircle, FileText, Plus, 
  ArrowRight, AlertTriangle, Inbox 
} from "lucide-react";

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
        <td key={i} className="p-4.5 border-b border-slate-100">
          <div className="h-3 rounded bg-slate-200" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Status Badge ───────────────

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let classes = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ";
  
  if (s.includes("aprob") || s.includes("aceptad") || s.includes("pre_apro")) {
    classes += "bg-emerald-50 text-emerald-700 border-emerald-200/60";
  } else if (s.includes("pend")) {
    classes += "bg-amber-50 text-amber-700 border-amber-200/60";
  } else if (s.includes("rechaz")) {
    classes += "bg-rose-50 text-rose-700 border-rose-200/60";
  } else if (s.includes("progres") || s.includes("ejecu")) {
    classes += "bg-indigo-50 text-indigo-700 border-indigo-200/60";
  } else {
    classes += "bg-slate-50 text-slate-700 border-slate-200/60";
  }

  const dotClass = s.includes("aprob") || s.includes("aceptad") ? "bg-emerald-500" :
                   s.includes("pend") ? "bg-amber-500" :
                   s.includes("rechaz") ? "bg-rose-500" :
                   s.includes("progres") || s.includes("ejecu") ? "bg-indigo-500" : "bg-slate-500";

  return (
    <span className={classes}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotClass)} />
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Stat Card ────────

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
        "relative bg-white border rounded-2xl p-6 flex flex-col overflow-hidden transition-all duration-300 cursor-default",
        hovered ? "shadow-lg shadow-slate-200/50 -translate-y-1 border-slate-300" : "shadow-sm border-slate-200"
      )}
    >
      {/* Top color line on hover */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-transform duration-300 origin-left",
        accent.line,
        hovered ? "scale-x-100" : "scale-x-0"
      )} />

      {/* Corner glow */}
      <div className={cn(
        "absolute -top-8 -right-8 w-20 h-20 rounded-full blur-xl pointer-events-none transition-opacity duration-300",
        accent.bg,
        hovered ? "opacity-30" : "opacity-0"
      )} />

      {/* Content */}
      <div className="flex justify-between items-start mb-3.5 relative z-10">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{value ?? 0}</p>
        </div>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300",
          hovered ? accent.iconBg : "bg-slate-50 text-slate-500"
        )}>
          {icon}
        </div>
      </div>

      <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold relative z-10", accent.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", accent.dot)} />
        {tag}
      </span>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────

function EmptyState({ onNewRequest }: { onNewRequest: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 m-4">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/50">
        <Inbox className="h-7 w-7 text-slate-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-700">Sin solicitudes recientes</p>
        <p className="mt-1 text-xs font-medium text-slate-500">Crea tu primera solicitud para comenzar.</p>
      </div>
      <button
        onClick={onNewRequest}
        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 shadow-md shadow-slate-200 transition-all active:scale-95"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
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
      accent: { bg: "bg-amber-50", iconBg: "bg-amber-100 text-amber-600", text: "text-amber-600", dot: "bg-amber-500", line: "bg-amber-500" },
      icon: <Clock className="h-5 w-5" strokeWidth={2} />,
    },
    {
      title: "En Progreso",
      value: summary?.in_progress ?? null,
      tag: "En proceso",
      accent: { bg: "bg-indigo-50", iconBg: "bg-indigo-100 text-indigo-600", text: "text-indigo-600", dot: "bg-indigo-500", line: "bg-indigo-500" },
      icon: <Zap className="h-5 w-5" strokeWidth={2} />,
    },
    {
      title: "Aceptadas",
      value: summary?.accepted ?? null,
      tag: "Aprobadas",
      accent: { bg: "bg-emerald-50", iconBg: "bg-emerald-100 text-emerald-600", text: "text-emerald-600", dot: "bg-emerald-500", line: "bg-emerald-500" },
      icon: <CheckCircle className="h-5 w-5" strokeWidth={2} />,
    },
    {
      title: "Finalizadas",
      value: summary?.completed ?? null,
      tag: "Completadas",
      accent: { bg: "bg-slate-100", iconBg: "bg-slate-200 text-slate-700", text: "text-slate-600", dot: "bg-slate-500", line: "bg-slate-500" },
      icon: <FileText className="h-5 w-5" strokeWidth={2} />,
    },
  ], [summary]);

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Asamblea Legislativa · Transporte
            </p>
            <h1 className="mt-1 text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Dashboard
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Resumen general de solicitudes de transporte
            </p>
          </div>

          <button
            onClick={() => navigate("/nueva-solicitud")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
            Nueva solicitud
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 mb-8 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-rose-600" strokeWidth={2.5} />
            <p className="text-sm font-bold text-rose-700">{error}</p>
          </div>
        )}

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => <StatCard key={c.title} {...c} loading={loading} />)}
        </div>

        {/* ── Recent Requests Table ── */}
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-100">
          {/* Table Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Solicitudes recientes</h2>
              <p className="text-xs font-medium text-slate-500 mt-1">Últimas solicitudes registradas en el sistema</p>
            </div>
            {!loading && recent.length > 0 && (
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 shadow-sm"
              >
                Ver historial completo
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-200">
                  {(["Código", "Fecha", "Tipo", "Estado"] as const).map((h, i) => (
                    <th key={h} className={cn(
                      "text-[11px] font-black uppercase tracking-widest text-slate-400 px-6 py-4",
                      i === 3 ? "text-right" : "text-left"
                    )}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>{[1,2,3,4].map(i => <SkeletonRow key={i} />)}</>
                ) : recent.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState onNewRequest={() => navigate("/nueva-solicitud")} />
                    </td>
                  </tr>
                ) : (
                  recent.map((r, index) => (
                    <tr 
                      key={r.code} 
                      className={cn(
                        "group hover:bg-slate-50/80 cursor-pointer transition-colors duration-200",
                        index !== recent.length - 1 && "border-b border-slate-100"
                      )}
                      onClick={() => navigate(`/solicitudes/transporte/${r.code}`)}
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <span className="w-1.5 h-8 rounded-full bg-indigo-500 flex-shrink-0" />
                          <span className="text-sm font-black text-slate-900 tracking-tight">{r.code}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-sm font-medium text-slate-500">{r.date}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-sm font-bold text-slate-800">{r.type}</span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
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
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="w-full flex items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
              >
                Ver todas las solicitudes
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
