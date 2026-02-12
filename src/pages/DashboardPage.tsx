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
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 rounded-lg bg-slate-200 animate-pulse sm:h-4 sm:w-28" />
          <div className="h-8 w-16 rounded-xl bg-slate-300 animate-pulse sm:h-10 sm:w-20" />
          <div className="h-2.5 w-20 rounded-lg bg-slate-200 animate-pulse sm:h-3 sm:w-24" />
        </div>
        <div className="h-12 w-12 rounded-xl bg-slate-100 animate-pulse sm:h-14 sm:w-14" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100 last:border-0">
      <td className="px-3 py-3 sm:px-6 sm:py-5">
        <div className="h-3.5 w-24 rounded-lg bg-slate-200 sm:h-4 sm:w-32" />
      </td>
      <td className="hidden px-6 py-5 sm:table-cell">
        <div className="h-4 w-28 rounded-lg bg-slate-200" />
      </td>
      <td className="px-3 py-3 sm:px-6 sm:py-5">
        <div className="h-3.5 w-28 rounded-lg bg-slate-200 sm:h-4 sm:w-36" />
      </td>
      <td className="px-3 py-3 text-right sm:px-6 sm:py-5">
        <div className="ml-auto h-6 w-20 rounded-full bg-slate-200 sm:h-7 sm:w-28" />
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
        const [s, r] = await Promise.all([
          getDashboardSummary(),
          getRecentRequests(),
        ]);
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
        iconBg: "bg-amber-50",
        ringColor: "ring-amber-200",
        icon: (
          <svg
            className="h-6 w-6 text-amber-600 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "En Progreso",
        value: summary?.in_progress ?? null,
        tag: "En proceso",
        color: "text-blue-600",
        bgColor: "from-blue-500 to-cyan-500",
        iconBg: "bg-blue-50",
        ringColor: "ring-blue-200",
        icon: (
          <svg
            className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
      },
      {
        title: "Aceptadas",
        value: summary?.accepted ?? null,
        tag: "Aprobadas",
        color: "text-emerald-600",
        bgColor: "from-emerald-500 to-teal-500",
        iconBg: "bg-emerald-50",
        ringColor: "ring-emerald-200",
        icon: (
          <svg
            className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        title: "Finalizadas",
        value: summary?.completed ?? null,
        tag: "Completadas",
        color: "text-slate-600",
        bgColor: "from-slate-500 to-slate-600",
        iconBg: "bg-slate-50",
        ringColor: "ring-slate-200",
        icon: (
          <svg
            className="h-6 w-6 text-slate-600 sm:h-7 sm:w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      },
    ];
  }, [summary]);

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return "inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs";
    }
    if (statusLower.includes("pend")) {
      return "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs";
    }
    if (statusLower.includes("progres")) {
      return "inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs";
    }
    return "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs";
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes("aprob") || statusLower.includes("aceptad")) {
      return (
        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (statusLower.includes("pend")) {
      return (
        <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8 sm:space-y-8">
      {/* ============================================ */}
      {/* MOBILE FIRST: Header compacto                */}
      {/* ============================================ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:mt-1.5 sm:text-base">
            Resumen general de tus solicitudes de transporte
          </p>
        </div>

        {/* Botón: Icono solo en móvil, texto en desktop */}
        <button
          onClick={() => navigate("/nueva-solicitud")}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 active:scale-95 sm:rounded-2xl sm:px-6"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Nueva Solicitud</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {/* ============================================ */}
      {/* Error Alert - Responsive                     */}
      {/* ============================================ */}
      {error && (
        <div className="overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm sm:rounded-2xl">
          <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-600 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 sm:text-base">
                Error al cargar
              </h4>
              <p className="mt-0.5 text-xs font-semibold text-red-700 sm:mt-1 sm:text-sm">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MOBILE FIRST: Cards Grid                     */}
      {/* 1 columna en móvil, 2 en tablet, 4 en desktop */}
      {/* ============================================ */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards.map((card) => (
              <div
                key={card.title}
                className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 sm:p-6 sm:rounded-3xl sm:shadow-lg sm:hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 sm:text-sm">
                      {card.title}
                    </p>

                    <div className="mt-2 sm:mt-3">
                      <p className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                        {card.value ?? 0}
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${card.color} bg-opacity-10 ring-1 ${card.ringColor} sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs`}
                      >
                        <span
                          className={`h-1 w-1 rounded-full sm:h-1.5 sm:w-1.5 ${card.color.replace(
                            "text-",
                            "bg-"
                          )}`}
                        />
                        {card.tag}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${card.iconBg} shadow-sm transition-all group-hover:scale-110 sm:h-14 sm:w-14 sm:rounded-2xl`}
                  >
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* ============================================ */}
      {/* MOBILE FIRST: Tabla de solicitudes recientes */}
      {/* ============================================ */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-md sm:rounded-3xl sm:shadow-xl">
        {/* Table Header - Responsive */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
                Solicitudes Recientes
              </h2>
              <p className="mt-0.5 text-xs text-slate-600 sm:mt-1 sm:text-sm">
                Últimas solicitudes registradas
              </p>
            </div>

            {!loading && recent.length > 0 && (
              <button
                onClick={() => navigate("/mis-solicitudes")}
                className="group hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-blue-600 transition-all hover:bg-blue-50 sm:inline-flex sm:rounded-xl sm:px-4 sm:py-2 sm:text-sm"
              >
                Ver todas
                <svg
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Table - Mobile optimized */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
                  Código
                </th>
                {/* Ocultar columna Fecha en móvil */}
                <th className="hidden px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600 sm:table-cell">
                  Fecha
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
                  Tipo
                </th>
                <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
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
                  <td colSpan={4} className="px-4 py-12 text-center sm:px-6 sm:py-16">
                    <div className="flex flex-col items-center gap-2 sm:gap-3">
                      <div className="rounded-full bg-slate-100 p-3 sm:p-4">
                        <svg
                          className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 sm:text-base">
                          No hay solicitudes recientes
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-sm">
                          Crea tu primera solicitud para comenzar
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/nueva-solicitud")}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
                      >
                        <svg
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                          />
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
                    className="transition-colors hover:bg-slate-50/50 active:bg-slate-100/50"
                  >
                    {/* Código */}
                    <td className="px-3 py-3 sm:px-6 sm:py-5">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500 sm:h-2 sm:w-2" />
                        <span className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                          {r.code}
                        </span>
                      </div>
                    </td>

                    {/* Fecha - Oculta en móvil */}
                    <td className="hidden px-6 py-5 sm:table-cell">
                      <span className="text-sm font-semibold text-slate-700">
                        {r.date}
                      </span>
                    </td>

                    {/* Tipo */}
                    <td className="px-3 py-3 sm:px-6 sm:py-5">
                      <span className="block truncate text-xs font-bold text-slate-900 sm:text-sm">
                        {r.type}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="px-3 py-3 text-right sm:px-6 sm:py-5">
                      <span className={getStatusBadge(r.status)}>
                        {getStatusIcon(r.status)}
                        <span className="truncate">{r.status}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Ver todas en móvil */}
        {!loading && recent.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:px-8 sm:py-4">
            <button
              onClick={() => navigate("/mis-solicitudes")}
              className="group inline-flex w-full items-center justify-center gap-1.5 text-xs font-bold text-blue-600 transition-all hover:text-blue-700 sm:w-auto sm:justify-start sm:gap-2 sm:text-sm"
            >
              Ver todas las solicitudes
              <svg
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4"
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