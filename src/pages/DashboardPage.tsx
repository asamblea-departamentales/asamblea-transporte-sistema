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
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-[0_14px_40px_-28px_rgba(15,23,42,.45)] backdrop-blur sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.22)_1px,transparent_0)] [background-size:18px_18px] opacity-60" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-3 w-20 animate-pulse rounded-lg bg-slate-200/80 sm:h-4 sm:w-28" />
          <div className="h-9 w-20 animate-pulse rounded-2xl bg-slate-300/80 sm:h-10 sm:w-24" />
          <div className="h-3 w-24 animate-pulse rounded-lg bg-slate-200/80 sm:w-28" />
        </div>
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-100 sm:h-14 sm:w-14" />
      </div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-4">
        <div className="h-4 w-28 animate-pulse rounded-lg bg-slate-200/80" />
      </td>
      <td className="hidden px-6 py-4 sm:table-cell">
        <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200/80" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200/80" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-7 w-28 animate-pulse rounded-full bg-slate-200/80" />
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
        color: "text-amber-700",
        glow: "bg-amber-500",
        iconBg: "bg-amber-50",
        ringColor: "ring-amber-200/80",
        icon: (
          <svg className="h-6 w-6 text-amber-700 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "En Progreso",
        value: summary?.in_progress ?? null,
        tag: "En proceso",
        color: "text-blue-700",
        glow: "bg-blue-500",
        iconBg: "bg-blue-50",
        ringColor: "ring-blue-200/80",
        icon: (
          <svg className="h-6 w-6 text-blue-700 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      },
      {
        title: "Aceptadas",
        value: summary?.accepted ?? null,
        tag: "Aprobadas",
        color: "text-emerald-700",
        glow: "bg-emerald-500",
        iconBg: "bg-emerald-50",
        ringColor: "ring-emerald-200/80",
        icon: (
          <svg className="h-6 w-6 text-emerald-700 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Finalizadas",
        value: summary?.completed ?? null,
        tag: "Completadas",
        color: "text-slate-700",
        glow: "bg-slate-500",
        iconBg: "bg-slate-50",
        ringColor: "ring-slate-200/80",
        icon: (
          <svg className="h-6 w-6 text-slate-700 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ];
  }, [summary]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("aprob") || s.includes("aceptad")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200/80";
    }
    if (s.includes("pend")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700 ring-1 ring-amber-200/80";
    }
    if (s.includes("progres")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700 ring-1 ring-blue-200/80";
    }
    return "inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200/80";
  };

  const getStatusIcon = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("aprob") || s.includes("aceptad")) {
      return (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    if (s.includes("pend")) {
      return (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
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
    <div className="pb-10">
      {/* ✅ Fondo moderno (sin librerías) */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-200/45 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-emerald-200/35 blur-3xl" />
          <div className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,.20)_1px,transparent_0)] [background-size:18px_18px] opacity-60" />
        </div>

        <div className="relative mx-auto max-w-6xl space-y-7 px-4 py-7 sm:space-y-10 sm:px-8 sm:py-10">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
                Resumen general de tus solicitudes de transporte
              </p>
            </div>

            <button
              onClick={() => navigate("/nueva-solicitud")}
              className={[
                "group inline-flex items-center justify-center gap-2",
                "rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white",
                "shadow-sm transition-all hover:opacity-95 active:scale-95",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25",
              ].join(" ")}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Nueva Solicitud</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="overflow-hidden rounded-2xl border border-red-200/70 bg-white/80 shadow-sm backdrop-blur">
              <div className="flex items-start gap-3 p-4 sm:gap-4 sm:p-5">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-50 ring-1 ring-red-200/70">
                  <svg className="h-5 w-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 sm:text-base">Error al cargar</h4>
                  <p className="mt-0.5 text-xs font-semibold text-red-700 sm:mt-1 sm:text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : cards.map((card) => (
                  <div
                    key={card.title}
                    className={[
                      "group relative overflow-hidden rounded-3xl",
                      "border border-slate-200/70 bg-white/70 backdrop-blur",
                      "p-5 sm:p-6",
                      "shadow-[0_18px_50px_-35px_rgba(15,23,42,.55)]",
                      "transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-[0_26px_70px_-45px_rgba(15,23,42,.6)]",
                      "focus-within:ring-4 focus-within:ring-blue-500/20",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-25",
                        card.glow,
                      ].join(" ")}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />

                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-xs font-extrabold tracking-tight text-slate-600 sm:text-sm">
                          {card.title}
                        </p>

                        <p className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:mt-3 sm:text-4xl">
                          {card.value ?? 0}
                        </p>

                        <div className="mt-3">
                          <span
                            className={[
                              "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
                              "text-[11px] font-extrabold sm:text-xs",
                              card.color,
                              "bg-slate-50 ring-1",
                              card.ringColor,
                            ].join(" ")}
                          >
                            <span className={["h-1.5 w-1.5 rounded-full", card.glow].join(" ")} />
                            {card.tag}
                          </span>
                        </div>
                      </div>

                      <div
                        className={[
                          "grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl",
                          card.iconBg,
                          "ring-1 ring-slate-200/70 shadow-sm",
                          "transition-transform group-hover:scale-[1.06]",
                          "sm:h-14 sm:w-14",
                        ].join(" ")}
                      >
                        {card.icon}
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Tabla */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-[0_18px_60px_-45px_rgba(15,23,42,.55)] backdrop-blur">
            <div className="border-b border-slate-200/70 bg-white/60 px-4 py-5 sm:px-8 sm:py-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
                    Solicitudes Recientes
                  </h2>
                  <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                    Últimas solicitudes registradas
                  </p>
                </div>

                {!loading && recent.length > 0 && (
                  <button
                    onClick={() => navigate("/mis-solicitudes")}
                    className="hidden rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200/70 transition-all hover:bg-white sm:inline-flex"
                  >
                    Ver todas
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200/70 bg-slate-50/60">
                    <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
                      Código
                    </th>
                    <th className="hidden px-6 py-4 text-left text-xs font-extrabold uppercase tracking-wider text-slate-600 sm:table-cell">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-right text-[10px] font-extrabold uppercase tracking-wider text-slate-600 sm:px-6 sm:py-4 sm:text-xs">
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
                      <td colSpan={4} className="px-4 py-14 text-center sm:px-6 sm:py-16">
                        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                          <div className="rounded-full bg-slate-100 p-4 ring-1 ring-slate-200/70">
                            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>

                          <div>
                            <p className="text-sm font-black text-slate-900 sm:text-base">
                              No hay solicitudes recientes
                            </p>
                            <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                              Crea tu primera solicitud para comenzar.
                            </p>
                          </div>

                          <button
                            onClick={() => navigate("/nueva-solicitud")}
                            className="mt-1 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition-all hover:opacity-95 active:scale-95"
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
                        className="transition-colors hover:bg-white/60"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            <span className="truncate text-sm font-extrabold text-slate-900">
                              {r.code}
                            </span>
                          </div>
                        </td>

                        <td className="hidden px-6 py-4 sm:table-cell">
                          <span className="text-sm font-semibold text-slate-700">{r.date}</span>
                        </td>

                        <td className="px-4 py-4 sm:px-6">
                          <span className="block truncate text-sm font-bold text-slate-900">
                            {r.type}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right sm:px-6">
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

            {!loading && recent.length > 0 && (
              <div className="border-t border-slate-200/70 bg-white/50 px-4 py-4 sm:px-8">
                <button
                  onClick={() => navigate("/mis-solicitudes")}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-white/80 px-4 py-3 text-sm font-extrabold text-slate-700 ring-1 ring-slate-200/70 transition-all hover:bg-white sm:hidden"
                >
                  Ver todas las solicitudes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
