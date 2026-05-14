// src/pages/MyRequestsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCombinedRequests } from "../hooks/useCombinedRequests";
import { ESTADOS } from "../constants/requests.constants";
import { getStatusStyle, isCompleted } from "../lib/format";
import { InnerLoading } from "../components/InnerLoading";
import type { RequestStatus } from "../services/requests.service";
import type { CombinedRequest, Modulo } from "../hooks/useCombinedRequests";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFechaLinda(fecha: string): string {
  const d = new Date(fecha);
  const dia  = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dia} • ${hora}`;
}

// ─── Módulo config ─────────────────────────────────────────────────────────────

type ModuloConfig = {
  label: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  icon: React.ReactNode;
};

const MODULO_CONFIG: Record<Modulo, ModuloConfig> = {
  transporte: {
    label: "Transporte",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200/70",
    dotClass:   "bg-blue-500",
    borderClass: "border-l-blue-500",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6.5 15.5h11M7.5 6.5h9l1.6 4.8c.26.78.4 1.6.4 2.42V17a2 2 0 01-2 2h-.5a2 2 0 01-4 0h-4a2 2 0 01-4 0H5a2 2 0 01-2-2v-3.28c0-.82.14-1.64.4-2.42L5 6.5h2.5Z" strokeLinejoin="round"/>
        <path d="M6 11.5h12" strokeLinecap="round"/>
      </svg>
    ),
  },
  mantenimiento: {
    label: "Mantenimiento",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    dotClass:   "bg-emerald-500",
    borderClass: "border-l-emerald-500",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 7l-7 7-4-4 7-7 4 4Z" strokeLinejoin="round"/>
        <path d="M3 21l6-2 10-10-4-4L5 15l-2 6Z" strokeLinejoin="round"/>
      </svg>
    ),
  },
  combustible: {
    label: "Combustible",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    dotClass:   "bg-amber-500",
    borderClass: "border-l-amber-500",
    icon: (
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M7 3h8v18H7V3Z" strokeLinejoin="round"/>
        <path d="M15 7h2l2 2v10a2 2 0 01-2 2h-2" strokeLinejoin="round"/>
        <path d="M9 7h4" strokeLinecap="round"/>
        <path d="M9 11h4" strokeLinecap="round" opacity="0.7"/>
      </svg>
    ),
  },
};

// ─── Module Badge ──────────────────────────────────────────────────────────────

function ModuloBadge({ modulo }: { modulo: Modulo }) {
  const cfg = MODULO_CONFIG[modulo];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold ring-1 ${cfg.badgeClass}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

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

// ─── Dot color por estado ──────────────────────────────────────────────────────

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

function getDotColor(estado: string): string {
  return BG_DOT[estado.toLowerCase()] ?? "bg-gray-300";
}

// ─── Empty state ───────────────────────────────────────────────────────────────

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

// ─── Paginación ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  const btn = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-800">{page}</span> de{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
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

// ─── Filter Modal (estado + módulo) ───────────────────────────────────────────

const MODULOS_FILTER: { value: Modulo | ""; label: string }[] = [
  { value: "",             label: "Todos los módulos" },
  { value: "transporte",   label: "Transporte" },
  { value: "mantenimiento",label: "Mantenimiento" },
  { value: "combustible",  label: "Combustible" },
];

function FilterModal({ open, onClose, currentEstado, currentModulo, onEstadoChange, onModuloChange, onClear }: {
  open: boolean;
  onClose: () => void;
  currentEstado: RequestStatus | "";
  currentModulo: Modulo | "";
  onEstadoChange: (e: RequestStatus | "") => void;
  onModuloChange: (m: Modulo | "") => void;
  onClear: () => void;
}) {
  if (!open) return null;
  const hasFilters = currentEstado !== "" || currentModulo !== "";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-6 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        {/* Handle móvil */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Filtrar solicitudes</h2>
            <p className="text-xs text-slate-500">Por módulo y estado</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 transition">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Módulo ── */}
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Módulo</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {MODULOS_FILTER.map((opt) => {
            const active = currentModulo === opt.value;
            const cfg = opt.value ? MODULO_CONFIG[opt.value] : null;
            return (
              <button
                key={opt.value}
                onClick={() => onModuloChange(opt.value)}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition
                  ${active
                    ? "border-slate-900 bg-slate-900 text-white shadow"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {cfg && (
                    <span className={active ? "text-white" : `text-${opt.value === "transporte" ? "blue" : opt.value === "mantenimiento" ? "emerald" : "amber"}-500`}>
                      {cfg.icon}
                    </span>
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

        {/* ── Estado ── */}
        <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Estado</p>
        <div className="grid grid-cols-2 gap-2">
          {ESTADOS.map((opt) => {
            const active = currentEstado === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onEstadoChange(opt.value as RequestStatus | "")}
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

        {hasFilters && (
          <button
            onClick={() => { onClear(); onClose(); }}
            className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </>
  );
}


// ─── Tarjeta mobile ────────────────────────────────────────────────────────────

function RequestCard({ req, isExpanded, onToggle }: {
  req: CombinedRequest;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = MODULO_CONFIG[req.modulo];
  return (
    <div className={`overflow-hidden rounded-2xl border-l-4 bg-white shadow-sm ring-1 transition-all
      ${cfg.borderClass}
      ${isExpanded ? "ring-indigo-200 shadow-md" : "ring-slate-100 hover:shadow-md hover:ring-slate-200"}
    `}>
      <button onClick={onToggle} className="w-full px-5 py-4 text-left">
        {/* Código + badge estado */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[15px] font-extrabold tracking-tight text-slate-900">{req.codigo}</span>
          <StatusBadge estado={req.estado} />
        </div>

        {/* Módulo badge + fecha */}
        <div className="mt-1.5 flex items-center gap-2">
          <ModuloBadge modulo={req.modulo} />
          <span className="text-xs text-slate-400">{formatFechaLinda(req.fecha_salida)}</span>
        </div>

        {/* Descripción / ruta */}
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
        <div className="mt-3.5 flex items-center justify-between">
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/solicitudes/${req.modulo}/${req.id}`;
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            >
              Ver detalle completo
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
          <span className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${isExpanded ? "text-indigo-600" : "text-slate-400"}`}
          >
            {isExpanded ? "Ocultar detalles" : "Ver detalles"}
            <svg
              className={`ml-auto h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </button>
    </div>
  );
}

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [expandedId,  setExpandedId]  = useState<number | null>(null);

  const {
    loading, isPartiallyLoaded, error, requests, total, totalPages, page,
    filters, searchInput,
    setPage, setSearchInput,
    handleEstadoChange, handleModuloChange, clearFilters,
  } = useCombinedRequests();

  // Solo mostrar spinner completo cuando NO hay datos todavía
  const showFullSpinner = loading && requests.length === 0;

  const hasFilters = filters.estado !== "" || filters.modulo !== "";

  const emptyMessage =
    hasFilters || filters.search
      ? "Cambia los filtros para ver resultados."
      : "Aún no tienes solicitudes registradas.";

  const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">

      {/* ENCABEZADO */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Historial
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total > 0 ? `${total} solicitud${total !== 1 ? "es" : ""} encontradas` : "Sin solicitudes"}
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

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* BUSCADOR + BOTÓN FILTRO */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por código, origen o destino..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </div>

        {/* Botón filtros */}
        <button
          onClick={() => setFilterOpen(true)}
          className={`relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border shadow-sm transition
            ${hasFilters
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          {hasFilters && (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Tags de filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Filtrando por:</span>
          {filters.modulo && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ring-1 ${MODULO_CONFIG[filters.modulo].badgeClass}`}>
              {MODULO_CONFIG[filters.modulo].icon}
              {MODULO_CONFIG[filters.modulo].label}
              <button onClick={() => handleModuloChange("")} className="ml-0.5 hover:opacity-70">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.estado && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 font-semibold text-indigo-700 ring-1 ring-indigo-200/70">
              <div className={`h-2 w-2 rounded-full ${getDotColor(filters.estado)}`} />
              {ESTADOS.find((e) => e.value === filters.estado)?.label}
              <button onClick={() => handleEstadoChange("")} className="ml-0.5 hover:opacity-70">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="text-slate-400 hover:text-slate-600 underline underline-offset-2">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Indicador de carga parcial */}
      {isPartiallyLoaded && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-2.5">
          <svg className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-xs font-semibold text-blue-600">Cargando más módulos...</span>
        </div>
      )}

      {/* ── TARJETAS (mobile + tablet) ── */}
      <div className="block space-y-3 lg:hidden">
        {showFullSpinner
          ? <InnerLoading message="Cargando solicitudes..." />
          : requests.length === 0 && !loading
            ? <EmptyState message={emptyMessage} />
            : requests.map((req) => (
              <RequestCard
                key={`${req.modulo}-${req.id}`}
                req={req}
                isExpanded={expandedId === req.id}
                onToggle={() => toggleExpand(req.id)}
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
              <th className="px-6 py-4">Módulo</th>
              <th className="px-6 py-4">Fecha</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {showFullSpinner
              ? <tr><td colSpan={6}><InnerLoading message="Cargando solicitudes..." /></td></tr>
              : requests.length === 0 && !loading
                ? (
                  <tr>
                    <td colSpan={6} className="py-16">
                      <EmptyState message={emptyMessage} />
                    </td>
                  </tr>
                )
                : requests.map((req) => {
                    const cfg = MODULO_CONFIG[req.modulo];
                    const isExpanded = expandedId === req.id;
                    return (
                      <>
                        <tr
                          key={`${req.modulo}-${req.id}`}
                          onClick={() => toggleExpand(req.id)}
                          className={`cursor-pointer border-b border-slate-50 transition-colors
                            ${isExpanded ? "bg-indigo-50/40" : "hover:bg-slate-50"}`}
                        >
                          {/* Código + barra de color del módulo */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-8 w-1 flex-shrink-0 rounded-full ${cfg.dotClass}`} />
                              <span className="font-extrabold tracking-tight text-slate-900">{req.codigo}</span>
                            </div>
                          </td>

                          {/* Módulo */}
                          <td className="px-6 py-4">
                            <ModuloBadge modulo={req.modulo} />
                          </td>

                          {/* Fecha */}
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatFechaLinda(req.fecha_salida)}
                          </td>

                          {/* Descripción / ruta */}
                          <td className="max-w-[220px] px-6 py-4">
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
                              ${isExpanded ? "text-indigo-600" : "text-slate-400"}`}
                            >
                              {isExpanded ? "Ocultar" : "Ver detalles"}
                              <svg
                                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </td>
                        </tr>

                        {/* Fila de detalle expandida — por ahora placeholder hasta conectar detalle por módulo */}
                        {isExpanded && (
                          <tr key={`detail-${req.modulo}-${req.id}`} className="border-b border-slate-100">
                            <td colSpan={6} className="bg-slate-50/60 px-8 py-4">
                              <p className="text-sm text-slate-500">
                                <span className="font-bold text-slate-700">Unidad:</span>{" "}
                                {req.unidad?.nombre ?? "—"} &nbsp;·&nbsp;
                                <span className="font-bold text-slate-700">Solicitante:</span>{" "}
                                {req.solicitante?.name ?? "—"}
                              </p>
                              <button
                                onClick={() => navigate(`/solicitudes/${req.modulo}/${req.id}`)}
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
                              >
                                Ver detalle completo
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
            }
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal filtros */}
      <FilterModal
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        currentEstado={filters.estado}
        currentModulo={filters.modulo}
        onEstadoChange={handleEstadoChange}
        onModuloChange={handleModuloChange}
        onClear={() => { clearFilters(); setFilterOpen(false); }}
      />
    </div>
  );
}