import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRequests } from "../hooks/useRequests";
import { ESTADOS } from "../constants/requests.constants";
import { getStatusStyle, isCompleted } from "../lib/format";
import RequestDetail from "../components/ui/RequestDetail";
import type { RequestStatus, Request } from "../services/requests.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "25 Feb 2026 • 08:09 AM" */
function formatFechaLinda(fecha: string): string {
  const d = new Date(fecha);
  const dia  = d.toLocaleDateString("es-ES",  { day: "2-digit", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-ES",  { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dia} • ${hora}`;
}

// ─── Color de borde izquierdo por estado ──────────────────────────────────────
const BORDER_COLOR: Record<string, string> = {
  pendiente:    "border-l-amber-400",
  aprobada:     "border-l-emerald-500",
  en_ejecucion: "border-l-indigo-500",
  completada:   "border-l-slate-400",
  finalizada:   "border-l-slate-400",
  rechazada:    "border-l-red-400",
  observada:    "border-l-blue-400",
  borrador:     "border-l-gray-300",
};

const BG_DOT: Record<string, string> = {
  pendiente:    "bg-amber-400",
  aprobada:     "bg-emerald-500",
  en_ejecucion: "bg-indigo-500",
  completada:   "bg-slate-400",
  finalizada:   "bg-slate-400",
  rechazada:    "bg-red-400",
  observada:    "bg-blue-400",
  borrador:     "bg-gray-300",
};

function getBorderColor(estado: string): string {
  return BORDER_COLOR[estado.toLowerCase()] ?? "border-l-gray-300";
}

function getDotColor(estado: string): string {
  return BG_DOT[estado.toLowerCase()] ?? "bg-gray-300";
}

// ─── Badge de estado ──────────────────────────────────────────────────────────
function StatusBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${getStatusStyle(estado)}`}>
      {isCompleted(estado) && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {estado.replace("_", " ")}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
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
}

// ─── Paginación ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  const btn = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-800">{page}</span> de <span className="font-semibold text-slate-800">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btn}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Anterior
        </button>
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={btn}>
          Siguiente
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

// ─── Modal / Sheet de filtros ─────────────────────────────────────────────────
function FilterModal({ open, onClose, currentEstado, onEstadoChange }: {
  open: boolean;
  onClose: () => void;
  currentEstado: RequestStatus | "";
  onEstadoChange: (e: RequestStatus | "") => void;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[400px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        {/* Handle móvil */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Filtrar solicitudes</h2>
            <p className="text-xs text-slate-500">Selecciona un estado</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {ESTADOS.map((opt) => {
            const active = currentEstado === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onEstadoChange(opt.value as RequestStatus | ""); onClose(); }}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition
                  ${active
                    ? "border-indigo-500 bg-indigo-600 text-white shadow"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {opt.value && (
                    <div className={`h-2 w-2 rounded-full ${active ? "bg-white/60" : getDotColor(opt.value)}`} />
                  )}
                  {opt.label}
                </div>
                {active && (
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {currentEstado && (
          <button
            onClick={() => { onEstadoChange(""); onClose(); }}
            className="mt-3 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
          >
            Limpiar filtro
          </button>
        )}
      </div>
    </>
  );
}

// ─── Tarjeta de solicitud (móvil + tablet) ────────────────────────────────────
function RequestCard({ req, isExpanded, expandedRequest, onToggle, onComplete }: {
  req: Request;
  isExpanded: boolean;
  expandedRequest: Request | null;
  onToggle: () => void;
  onComplete: (id: number) => Promise<void>;
}) {
  return (
    <div className={`overflow-hidden rounded-2xl border-l-4 bg-white shadow-sm ring-1 transition-all
      ${getBorderColor(req.estado)}
      ${isExpanded ? "ring-indigo-200 shadow-md" : "ring-slate-100 hover:shadow-md hover:ring-slate-200"}
    `}>
      <button onClick={onToggle} className="w-full px-5 py-4 text-left">
        {/* Código + badge */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[15px] font-extrabold tracking-tight text-slate-900">{req.codigo}</span>
          <StatusBadge estado={req.estado} />
        </div>

        {/* Fecha */}
        <p className="mt-1 text-xs text-slate-400">{formatFechaLinda(req.fecha_salida)}</p>

        {/* Ruta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-slate-300" />
            <span className="truncate">{req.origen}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <div className="h-2 w-2 flex-shrink-0 rounded-full bg-slate-800" />
            <span className="truncate">{req.destino}</span>
          </div>
        </div>

        {/* Ver detalles */}
        <div className="mt-3.5 flex justify-end">
          <span className={`flex items-center gap-1 text-xs font-semibold transition-colors
            ${isExpanded ? "text-indigo-600" : "text-slate-400"}`}
          >
            {isExpanded ? "Ocultar detalles" : "Ver detalles"}
            <svg
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>

      {isExpanded && expandedRequest && (
        <RequestDetail request={expandedRequest} onComplete={onComplete} />
      )}
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border-l-4 border-l-slate-200 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div className="h-5 w-36 rounded-lg bg-slate-100" />
        <div className="h-5 w-20 rounded-full bg-slate-100" />
      </div>
      <div className="mt-2 h-3 w-36 rounded bg-slate-100" />
      <div className="mt-4 space-y-2">
        <div className="h-3.5 w-48 rounded bg-slate-100" />
        <div className="h-3.5 w-40 rounded bg-slate-100" />
      </div>
      <div className="mt-4 flex justify-end">
        <div className="h-3 w-20 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4"><div className="h-4 w-36 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-3.5 w-44 rounded bg-slate-100" />
          <div className="h-3.5 w-36 rounded bg-slate-100" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-5 w-20 rounded-full bg-slate-100" /></td>
      <td className="px-6 py-4 text-right"><div className="ml-auto h-4 w-20 rounded bg-slate-100" /></td>
    </tr>
  );
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────
export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    loading, requests, total, totalPages, page,
    filters, searchInput, expandedId, expandedRequest,
    setPage, setSearchInput,
    handleRowClick, handleCompleteRequest, handleEstadoChange,
  } = useRequests();

  const emptyMessage = filters.estado || filters.search
    ? "Cambia los filtros para ver resultados."
    : "Aún no tienes solicitudes registradas.";

  const activeFilterLabel = ESTADOS.find((e) => e.value === filters.estado)?.label;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ENCABEZADO */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Historial
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {total > 0 ? `${total} solicitud${total !== 1 ? "es" : ""} registradas` : "Sin solicitudes"}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
        </div>

        {/* BUSCADOR + BOTÓN FILTRO */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar solicitud..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Botón filtros con indicador */}
            <button
              onClick={() => setFilterOpen(true)}
              className={`relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border shadow-sm transition
                ${filters.estado
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
              {filters.estado && (
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
              )}
            </button>
          </div>

          {/* Chips horizontales */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {ESTADOS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition
                  ${filters.estado === opt.value
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tag del filtro activo */}
          {activeFilterLabel && filters.estado && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Mostrando:</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700">
                {activeFilterLabel}
                <button onClick={() => handleEstadoChange("")} className="hover:text-indigo-900">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* ── TARJETAS (mobile + tablet) ── */}
        <div className="block space-y-3 lg:hidden">
          {loading
            ? <><CardSkeleton /><CardSkeleton /><CardSkeleton /></>
            : requests.length === 0
              ? <EmptyState message={emptyMessage} />
              : requests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  isExpanded={expandedId === req.id}
                  expandedRequest={expandedId === req.id ? expandedRequest : null}
                  onToggle={() => handleRowClick(req)}
                  onComplete={handleCompleteRequest}
                />
              ))
          }
          {!loading && totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>

        {/* ── TABLA (desktop lg+) ── */}
        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Fecha salida</th>
                <th className="px-6 py-4">Ruta</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <><RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton /><RowSkeleton /></>
                : requests.length === 0
                  ? (
                    <tr>
                      <td colSpan={5} className="py-16">
                        <EmptyState message={emptyMessage} />
                      </td>
                    </tr>
                  )
                  : requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer border-b border-slate-50 transition-colors
                          ${expandedId === req.id ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
                      >
                        {/* Código + barra de color */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-1 flex-shrink-0 rounded-full ${getDotColor(req.estado)}`} />
                            <span className="font-extrabold tracking-tight text-slate-900">{req.codigo}</span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatFechaLinda(req.fecha_salida)}
                        </td>

                        {/* Ruta */}
                        <td className="max-w-[260px] px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-slate-400">
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                              <span className="truncate" title={req.origen}>{req.origen}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-800" />
                              <span className="truncate" title={req.destino}>{req.destino}</span>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4">
                          <StatusBadge estado={req.estado} />
                        </td>

                        {/* Acción */}
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors
                            ${expandedId === req.id ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-500"}`}
                          >
                            {expandedId === req.id ? "Ocultar" : "Ver detalles"}
                            <svg
                              className={`h-3.5 w-3.5 transition-transform ${expandedId === req.id ? "rotate-90" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
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
              }
            </tbody>
          </table>

          {!loading && totalPages > 1 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>

      {/* Modal filtros */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        currentEstado={filters.estado}
        onEstadoChange={handleEstadoChange}
      />
    </div>
  );
}