import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDashboardSummary,
  getRecentRequests,
  type DashboardSummary,
  type RecentRequest,
} from "../services/dashboard.service";

function SkeletonCard() {
  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-28 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-10 w-20 rounded-xl bg-slate-300 animate-pulse" />
          <div className="h-3 w-24 rounded-lg bg-slate-200 animate-pulse" />
        </div>
        <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100 last:border-0">
      <td className="px-6 py-5">
        <div className="h-4 w-32 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-28 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-36 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="ml-auto h-7 w-28 rounded-full bg-slate-200" />
      </td>
    </tr>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [s, r] = await Promise.all([getDashboardSummary(), getRecentRequests()]);
        if (!alive) return;
        setSummary(s);
        setRecent(r);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar el dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const cards = useMemo(() => {
    return [
      {
        title: "Pendientes",
        value: summary?.pending ?? null,
        tag: "Por aprobar",
        color: "text-amber-600",
        bgColor: "from-amber-500 to-orange-500",
        iconBg: "bg-amber-100",
        icon: (
          <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "En Progreso",
        value: summary?.in_progress ?? null,
        tag: "En proceso",
        color: "text-blue-600",
        bgColor: "from-blue-500 to-cyan-500",
        iconBg: "bg-blue-100",
        icon: (
          <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        title: "Aceptadas",
        value: summary?.accepted ?? null,
        tag: "Aprobadas",
        color: "text-emerald-600",
        bgColor: "from-emerald-500 to-teal-500",
        iconBg: "bg-emerald-100",
        icon: (
          <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Finalizadas",
        value: summary?.completed ?? null,
        tag: "Completadas",
        color: "text-slate-600",
        bgColor: "from-slate-500 to-slate-600",
        iconBg: "bg-slate-100",
        icon: (
          <svg className="h-7 w-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ];
  }, [summary]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200";
    }
    if (statusLower.includes("pend")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200";
    }
    if (statusLower.includes("progres")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 ring-1 ring-blue-200";
    }
    return "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200";
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }
    if (statusLower.includes("pend")) {
      return (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1.5 text-base text-slate-600">
            Resumen general de tus solicitudes de transporte
          </p>
        </div>
        
        <button
          onClick={() => navigate("/nueva-solicitud")}
          className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Solicitud
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm">
          <div className="flex items-start gap-3 p-5">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-red-900">Error al cargar</h4>
              <p className="mt-1 text-sm font-semibold text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <div
                key={card.title}
                className="group overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-600">{card.title}</p>
                    
                    <div className="mt-3">
                      <p className="text-4xl font-black tracking-tight text-slate-900">
                        {card.value ?? 0}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${card.color} bg-opacity-10`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${card.color.replace('text-', 'bg-')}`} />
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.iconBg} shadow-sm transition-all group-hover:scale-110`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Recent Requests Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50">
        {/* Table Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">
                Solicitudes Recientes
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Últimas solicitudes registradas en el sistema
              </p>
            </div>
            
            {!loading && recent.length > 0 && (
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="group hidden sm:inline-flex items-center gap-2 rounded-xl px-4 py-2 font-bold text-sm text-blue-600 transition-all hover:bg-blue-50"
              >
                Ver todas
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Fecha
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tipo de Solicitud
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : recent.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">No hay solicitudes recientes</p>
                        <p className="mt-1 text-sm text-slate-500">Crea tu primera solicitud para comenzar</p>
                      </div>
                      <button
                        onClick={() => navigate("/nueva-solicitud")}
                        className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-blue-700"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Nueva Solicitud
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr
                    key={r.code}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-slate-900">{r.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700">{r.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">{r.type}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={getStatusBadge(r.status)}>
                        {getStatusIcon(r.status)}
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && recent.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-8 py-4">
            <button
              onClick={() => navigate("/mis-solicitudes")}
              className="group inline-flex items-center gap-2 font-bold text-sm text-blue-600 transition-all hover:text-blue-700"
            >
              Ver todas las solicitudes
              <svg 
                className="h-4 w-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}