// src/pages/MyRequestsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCombinedRequests } from "../hooks/useCombinedRequests";
import { ESTADOS } from "../constants/requests.constants";
import { getStatusStyle, isCompleted } from "../lib/format";
import { InnerLoading } from "../components/InnerLoading";
import type { RequestStatus } from "../services/requests.service";
import { cancelRequest as cancelTransporte } from "../services/requests.service";
import { cancelarMantenimiento } from "../services/mantenimiento.service";
import { cancelarSolicitud as cancelCombustible } from "../services/combustible.service";
import type { CombinedRequest, Modulo } from "../hooks/useCombinedRequests";
import { 
  CarFront, Wrench, Fuel, Inbox, ChevronLeft, ChevronRight, 
  Search, SlidersHorizontal, LayoutDashboard, AlertTriangle,
  X, Check, ChevronDown
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFechaLinda(fecha: string): string {
  const d = new Date(fecha);
  const dia = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dia} • ${hora}`;
}

function canUserCancel(estado: string): boolean {
  return estado.toLowerCase() === "pendiente";
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
    dotClass: "bg-blue-500",
    borderClass: "border-l-blue-500",
    icon: <CarFront className="h-3.5 w-3.5" strokeWidth={2.5} />,
  },
  mantenimiento: {
    label: "Mantenimiento",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
    icon: <Wrench className="h-3.5 w-3.5" strokeWidth={2.5} />,
  },
  combustible: {
    label: "Combustible",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    dotClass: "bg-amber-500",
    borderClass: "border-l-amber-500",
    icon: <Fuel className="h-3.5 w-3.5" strokeWidth={2.5} />,
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
      {isCompleted(estado) && <Check className="h-3 w-3" strokeWidth={3} />}
      {estado.replace("_", " ")}
    </span>
  );
}

// ─── Dot color por estado ──────────────────────────────────────────────────────

const BG_DOT: Record<string, string> = {
  pendiente: "bg-amber-400",
  aprobada: "bg-emerald-500",
  en_ejecucion: "bg-indigo-500",
  completada: "bg-slate-400",
  finalizada: "bg-slate-400",
  rechazada: "bg-red-400",
  observada: "bg-blue-400",
  borrador: "bg-gray-300",
};

function getDotColor(estado: string): string {
  return BG_DOT[estado.toLowerCase()] ?? "bg-gray-300";
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm ring-1 ring-slate-200/50">
        <Inbox className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-base font-bold text-slate-700">No hay solicitudes</p>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{message}</p>
      </div>
    </div>
  );
}

// ─── Paginación ────────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onPageChange }: {
  page: number; totalPages: number; onPageChange: (p: number) => void;
}) {
  const btn = "inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-slate-500">
        Página <span className="font-semibold text-slate-800">{page}</span> de{" "}
        <span className="font-semibold text-slate-800">{totalPages}</span>
      </p>
      <div className="flex gap-2">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className={btn}>
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          Anterior
        </button>
        <button onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={btn}>
          Siguiente
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Filter Modal (estado + módulo) ───────────────────────────────────────────

const MODULOS_FILTER: { value: Modulo | ""; label: string }[] = [
  { value: "", label: "Todos los módulos" },
  { value: "transporte", label: "Transporte" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "combustible", label: "Combustible" },
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
      <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white p-6 shadow-2xl sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        {/* Handle móvil */}
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Filtrar solicitudes</h2>
            <p className="text-sm text-slate-500">Por módulo y estado</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition">
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Módulo ── */}
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Módulo</p>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {MODULOS_FILTER.map((opt) => {
            const active = currentModulo === opt.value;
            const cfg = opt.value ? MODULO_CONFIG[opt.value] : null;
            return (
              <button
                key={opt.value}
                onClick={() => onModuloChange(opt.value)}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200
                  ${active
                    ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
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
                {active && <Check className="h-4 w-4 flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {/* ── Estado ── */}
        <p className="mb-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Estado</p>
        <div className="grid grid-cols-2 gap-2">
          {ESTADOS.map((opt) => {
            const active = currentEstado === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onEstadoChange(opt.value as RequestStatus | "")}
                className={`flex items-center justify-between rounded-xl border px-3.5 py-3 text-sm font-semibold transition-all duration-200
                  ${active
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {opt.value && (
                    <div className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${active ? "bg-white" : getDotColor(opt.value)}`} />
                  )}
                  {opt.label}
                </div>
                {active && <Check className="h-4 w-4 flex-shrink-0" strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={() => { onClear(); onClose(); }}
            className="mt-6 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
          >
            Limpiar todos los filtros
          </button>
        )}
      </div>
    </>
  );
}

// ─── Tarjeta mobile ────────────────────────────────────────────────────────────

function RequestCard({ req, isExpanded, onToggle, onCancel }: {
  req: CombinedRequest;
  isExpanded: boolean;
  onToggle: () => void;
  onCancel?: (req: CombinedRequest) => void;
}) {
  const cfg = MODULO_CONFIG[req.modulo];
  return (
    <div className={`overflow-hidden rounded-2xl border-l-4 bg-white shadow-sm ring-1 transition-all duration-300
      ${cfg.borderClass}
      ${isExpanded ? "ring-indigo-200 shadow-md translate-y-[-2px]" : "ring-slate-200/60 hover:shadow-md hover:ring-slate-300"}
    `}>
      <button onClick={onToggle} className="w-full px-5 py-4 text-left outline-none">
        {/* Código + badge estado */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-[15px] font-black tracking-tight text-slate-900">{req.codigo}</span>
          <StatusBadge estado={req.estado} />
        </div>

        {/* Módulo badge + fecha */}
        <div className="mt-2 flex items-center gap-2">
          <ModuloBadge modulo={req.modulo} />
          <span className="text-xs font-medium text-slate-400">{formatFechaLinda(req.fecha_salida)}</span>
        </div>

        {/* Descripción / ruta */}
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <div className="flex items-center gap-2.5 text-sm text-slate-500">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
            <span className="truncate">{req.origen}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm font-bold text-slate-800">
            <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-900" />
            <span className="truncate">{req.destino}</span>
          </div>
        </div>

        {/* Ver detalles */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
          {isExpanded && (
            <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/solicitudes/${req.modulo}/${req.codigo}`;
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
              >
                Ver detalle
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
              </button>
              {canUserCancel(req.estado) && onCancel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(req);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
          <span className={`ml-auto inline-flex items-center gap-1 text-xs font-bold transition-colors ${isExpanded ? "text-indigo-600" : "text-slate-400"}`}>
            {isExpanded ? "Ocultar" : "Detalles"}
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} strokeWidth={3} />
          </span>
        </div>
      </button>
    </div>
  );
}

// ─── PÁGINA ────────────────────────────────────────────────────────────────────

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Estados de Cancelación
  const [cancelTarget, setCancelTarget] = useState<CombinedRequest | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const {
    loading, isPartiallyLoaded, error, requests, total, totalPages, page,
    filters, searchInput,
    setPage, setSearchInput,
    handleEstadoChange, handleModuloChange, clearFilters,
    refresh,
  } = useCombinedRequests();

  const handleConfirmCancel = async () => {
    if (!cancelTarget || motivoCancelacion.trim().length < 10) return;
    setSubmittingCancel(true);
    setCancelError(null);
    try {
      if (cancelTarget.modulo === "transporte") {
        await cancelTransporte(cancelTarget.codigo, motivoCancelacion.trim());
      } else if (cancelTarget.modulo === "mantenimiento") {
        await cancelarMantenimiento(cancelTarget.id);
      } else if (cancelTarget.modulo === "combustible") {
        await cancelCombustible(cancelTarget.id);
      }
      setCancelTarget(null);
      setMotivoCancelacion("");
      refresh();
    } catch (err: any) {
      const detail = err instanceof Error ? err.message : "Error al cancelar la solicitud.";
      setCancelError(
        err?.response?.data?.error || err?.response?.data?.message || detail
      );
    } finally {
      setSubmittingCancel(false);
    }
  };

  const showFullSpinner = loading && requests.length === 0;
  const hasFilters = filters.estado !== "" || filters.modulo !== "";
  const emptyMessage =
    hasFilters || filters.search
      ? "No encontramos resultados con los filtros actuales."
      : "Aún no tienes solicitudes registradas en el sistema.";

  const toggleExpand = (id: number) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">

      {/* ENCABEZADO */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Historial
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            {total > 0 ? `${total} solicitud${total !== 1 ? "es" : ""} encontradas` : "Sin solicitudes"}
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow sm:inline-flex"
        >
          <LayoutDashboard className="h-4 w-4" strokeWidth={2.5} />
          Dashboard
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3.5 text-sm font-bold text-rose-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={2.5} />
          {error}
        </div>
      )}

      {/* BUSCADOR + BOTÓN FILTRO */}
      <div className="flex gap-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" strokeWidth={2} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por código, origen o destino..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        {/* Botón filtros */}
        <button
          onClick={() => setFilterOpen(true)}
          className={`relative grid h-[52px] w-[52px] flex-shrink-0 place-items-center rounded-2xl border shadow-sm transition duration-200
            ${hasFilters
              ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-300"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
          {hasFilters && (
            <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Tags de filtros activos */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 animate-in fade-in slide-in-from-top-1">
          <span className="font-medium">Filtrando por:</span>
          {filters.modulo && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-bold ring-1 ${MODULO_CONFIG[filters.modulo].badgeClass}`}>
              {MODULO_CONFIG[filters.modulo].icon}
              {MODULO_CONFIG[filters.modulo].label}
              <button onClick={() => handleModuloChange("")} className="ml-0.5 rounded-full hover:bg-black/10 transition p-0.5">
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            </span>
          )}
          {filters.estado && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700 ring-1 ring-slate-200/70">
              <div className={`h-2 w-2 rounded-full ring-2 ring-white ${getDotColor(filters.estado)}`} />
              {ESTADOS.find((e) => e.value === filters.estado)?.label}
              <button onClick={() => handleEstadoChange("")} className="ml-0.5 rounded-full hover:bg-black/10 transition p-0.5">
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="ml-2 font-semibold text-slate-400 hover:text-slate-700 transition">
            Limpiar todo
          </button>
        </div>
      )}

      {/* Indicador de carga parcial */}
      {isPartiallyLoaded && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 px-4 py-3 shadow-sm animate-in fade-in">
          <svg className="h-4 w-4 animate-spin text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-xs font-bold text-blue-700 tracking-wide">Actualizando datos en segundo plano...</span>
        </div>
      )}

      {/* ── TARJETAS (mobile + tablet) ── */}
      <div className="block space-y-4 lg:hidden">
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
                onCancel={(r) => setCancelTarget(r)}
              />
            ))
        }
        {!loading && totalPages > 1 && (
          <div className="pt-2">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* ── TABLA (desktop lg+) ── */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 lg:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-5">Código</th>
              <th className="px-6 py-5">Módulo</th>
              <th className="px-6 py-5">Fecha</th>
              <th className="px-6 py-5">Descripción</th>
              <th className="px-6 py-5">Estado</th>
              <th className="px-6 py-5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {showFullSpinner
              ? <tr><td colSpan={6}><InnerLoading message="Cargando solicitudes..." /></td></tr>
              : requests.length === 0 && !loading
                ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <EmptyState message={emptyMessage} />
                    </td>
                  </tr>
                )
                : requests.map((req) => {
                  const cfg = MODULO_CONFIG[req.modulo];
                  const isExpanded = expandedId === req.id;
                  return (
                    <React.Fragment key={`${req.modulo}-${req.id}`}>
                      <tr
                        onClick={() => toggleExpand(req.id)}
                        className={`group cursor-pointer border-b border-slate-100 transition-colors duration-200
                            ${isExpanded ? "bg-indigo-50/30" : "hover:bg-slate-50"}`}
                      >
                        {/* Código + barra de color del módulo */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-1.5 flex-shrink-0 rounded-full ${cfg.dotClass}`} />
                            <span className="font-black tracking-tight text-slate-900">{req.codigo}</span>
                          </div>
                        </td>

                        {/* Módulo */}
                        <td className="px-6 py-4.5">
                          <ModuloBadge modulo={req.modulo} />
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4.5 text-sm font-medium text-slate-500">
                          {formatFechaLinda(req.fecha_salida)}
                        </td>

                        {/* Descripción / ruta */}
                        <td className="max-w-[240px] px-6 py-4.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                              <span className="truncate" title={req.origen}>{req.origen}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                              <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-800" />
                              <span className="truncate" title={req.destino}>{req.destino}</span>
                            </div>
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4.5">
                          <StatusBadge estado={req.estado} />
                        </td>

                        {/* Acción */}
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex justify-end items-center gap-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold transition-colors
                                ${isExpanded ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            >
                              {isExpanded ? "Ocultar" : "Detalles"}
                            </span>
                            <ChevronDown 
                              className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? "rotate-180 text-indigo-600" : "text-slate-400 group-hover:text-slate-600"}`} 
                              strokeWidth={3} 
                            />
                          </div>
                        </td>
                      </tr>

                      {/* Fila de detalle expandida */}
                      {isExpanded && (
                        <tr className="border-b border-slate-200">
                          <td colSpan={6} className="bg-slate-50/80 px-8 py-5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-6 text-sm">
                                <div>
                                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Unidad Solicitante</span>
                                  <span className="font-bold text-slate-800">{req.unidad?.nombre ?? "—"}</span>
                                </div>
                                <div className="h-8 w-px bg-slate-200" />
                                <div>
                                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Usuario</span>
                                  <span className="font-bold text-slate-800">{req.solicitante?.name ?? "—"}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2.5">
                                {canUserCancel(req.estado) && (
                                  <button
                                    onClick={() => setCancelTarget(req)}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 active:scale-95"
                                  >
                                    Cancelar solicitud
                                  </button>
                                )}
                                <button
                                  onClick={() => navigate(`/solicitudes/${req.modulo}/${req.codigo}`)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-md shadow-slate-200 transition hover:bg-slate-800 hover:shadow-lg active:scale-95"
                                >
                                  Ver información completa
                                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
            }
          </tbody>
        </table>

        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Modal de Cancelación */}
      {cancelTarget && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => { if (!submittingCancel) setCancelTarget(null); }}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] bg-white p-6 shadow-2xl transition-all sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[24px] animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-slate-200 sm:hidden" />

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                <AlertTriangle className="h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black tracking-tight text-slate-900">¿Cancelar esta solicitud?</h3>
                <p className="mt-1.5 text-xs font-medium text-slate-500 leading-relaxed">
                  La solicitud <strong className="text-slate-800">{cancelTarget.codigo}</strong> será cancelada de forma permanente. Esta acción es irreversible.
                </p>

                {cancelError && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3.5 text-xs font-bold text-rose-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={2.5} />
                    {cancelError}
                  </div>
                )}

                <div className="mt-5">
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                    Motivo de la cancelación <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={motivoCancelacion}
                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                    placeholder="Ej. Se canceló la reunión programada o los datos fueron ingresados con errores..."
                    disabled={submittingCancel}
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-800 shadow-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-50 resize-none disabled:bg-slate-50"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Mínimo 10 caracteres</span>
                    <span className={motivoCancelacion.trim().length >= 10 ? "text-emerald-500" : "text-slate-400"}>
                      {motivoCancelacion.trim().length} / 10
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => { if (!submittingCancel) setCancelTarget(null); }}
                    disabled={submittingCancel}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
                  >
                    Volver atrás
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    disabled={submittingCancel || motivoCancelacion.trim().length < 10}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  >
                    {submittingCancel ? (
                      <>
                        <svg className="h-3.5 w-3.5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Cancelando...
                      </>
                    ) : (
                      "Confirmar Cancelación"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}