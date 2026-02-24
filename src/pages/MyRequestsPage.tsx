import { useNavigate } from "react-router-dom";
import { useRequests } from "../hooks/useRequests";
import { ESTADOS } from "../constants/requests.constants";
import { getStatusStyle, isCompleted, formatFechaCorta } from "../lib/format";
import RequestDetail from "../components/ui/RequestDetail";
import { SkeletonCard, SkeletonRow } from "../components/ui/Skeletons";
import type { RequestStatus } from "../services/requests.service";

// ─── Sub-componentes locales ──────────────────────────────────────────────────

function StatusBadge({ estado }: { estado: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusStyle(estado)}`}
    >
      {isCompleted(estado) && (
        <svg
          className="mr-1 h-3 w-3 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {estado}
    </span>
  );
}

function EmptyState({ message, inline }: { message: string; inline?: boolean }) {
  const content = (
    <div className={`flex flex-col items-center gap-3 ${inline ? "" : "mx-auto max-w-xs"}`}>
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-700">No hay solicitudes</p>
      <p className="text-xs text-slate-500">{message}</p>
    </div>
  );

  if (inline) return content;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      {content}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  mobile,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  mobile?: boolean;
}) {
  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  const prevBtn = (
    <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btn}>
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Anterior
    </button>
  );

  const nextBtn = (
    <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={btn}>
      Siguiente
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );

  if (mobile) {
    return (
      <div className="flex items-center justify-between sm:hidden">
        {prevBtn}
        <span className="text-sm text-slate-500">{page} / {totalPages}</span>
        {nextBtn}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
      <p className="text-sm text-slate-500">
        Página <span className="font-semibold text-slate-800">{page}</span> de{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        {prevBtn}
        {nextBtn}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const {
    loading, requests, total, totalPages, page,
    filters, searchInput, expandedId, expandedRequest,
    setPage, setSearchInput,
    handleRowClick, handleCompleteRequest, handleEstadoChange,
  } = useRequests();

  const emptyMessage =
    filters.estado || filters.search
      ? "Cambia los filtros para ver resultados."
      : "Aún no tienes solicitudes registradas.";

  return (
    <div className="min-h-screen bg-background-light px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
              Historial de Solicitudes
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {total > 0
                ? `${total} solicitud${total !== 1 ? "es" : ""} registradas`
                : "Sin solicitudes"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:self-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código, origen, destino..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ESTADOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition
                  ${filters.estado === opt.value
                    ? "border-indigo-500 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MÓVIL: tarjetas ── */}
        <div className="block sm:hidden space-y-2">
          {loading ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : requests.length === 0 ? (
            <EmptyState message={emptyMessage} />
          ) : (
            requests.map((req) => (
              <div key={req.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <button
                  onClick={() => handleRowClick(req)}
                  className="flex w-full items-center justify-between px-4 py-3.5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.codigo}</p>
                      <p className="text-xs text-slate-500">{formatFechaCorta(req.fecha_salida)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge estado={req.estado} />
                    <svg
                      className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${expandedId === req.id ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-600">
                  <span className="max-w-[120px] truncate">{req.origen}</span>
                  <svg className="h-3 w-3 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span className="max-w-[120px] truncate">{req.destino}</span>
                </div>
                {expandedId === req.id && expandedRequest && (
                  <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                )}
              </div>
            ))
          )}
        </div>

        {/* ── DESKTOP: tabla ── */}
        <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Código</th>
                  <th className="px-6 py-4">Fecha de Salida</th>
                  <th className="px-6 py-4">Origen → Destino</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <EmptyState message={emptyMessage} inline />
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer border-b border-slate-50 transition-all hover:bg-slate-50 ${expandedId === req.id ? "bg-slate-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                            <span className="font-bold text-slate-900">{req.codigo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">
                            {formatFechaCorta(req.fecha_salida)}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-[280px]">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <span className="max-w-[120px] truncate font-medium" title={req.origen}>{req.origen}</span>
                            <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="max-w-[120px] truncate font-medium" title={req.destino}>{req.destino}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">Transporte</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <StatusBadge estado={req.estado} />
                        </td>
                      </tr>
                      {expandedId === req.id && expandedRequest && (
                        <tr key={`detail-${req.id}`} className="border-b border-slate-100">
                          <td colSpan={5} className="p-0">
                            <RequestDetail request={expandedRequest} onComplete={handleCompleteRequest} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>

        {/* Paginación móvil */}
        {!loading && totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} mobile />
        )}

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}