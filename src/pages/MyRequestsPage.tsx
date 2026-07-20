// src/pages/MyRequestsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCombinedRequests } from "../hooks/useCombinedRequests";
import { ESTADOS } from "../constants/requests.constants";
import { InnerLoading } from "../components/InnerLoading";
import { cancelRequest as cancelTransporte } from "../services/requests.service";
import { cancelarMantenimiento } from "../services/mantenimiento.service";
import { cancelarSolicitud as cancelCombustible } from "../services/combustible.service";
import type { CombinedRequest } from "../hooks/useCombinedRequests";
import { Search, SlidersHorizontal, LayoutDashboard, AlertTriangle, X, RefreshCw, Info } from "lucide-react";

import { MODULO_CONFIG, getDotColor } from "../constants/modulo.config";
import { Pagination } from "../components/ui/Pagination";
import { EmptyState } from "../components/ui/EmptyState";
import { RequestCard } from "./solicitudes/components/RequestCard";
import { RequestTable } from "./solicitudes/components/RequestTable";
import { FilterModal } from "./solicitudes/components/FilterModal";
import { CancelModal } from "./solicitudes/components/CancelModal";

import { normalizeAppError } from "../lib/appError";
import { getRequestKey } from "../lib/requestIdentity";
export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [cancelTarget, setCancelTarget] = useState<CombinedRequest | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const {
    loading, isPartiallyLoaded, requests, total, totalPages, page,
    filters, searchInput, moduleStates, isBackendLimited,
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
        await cancelCombustible(cancelTarget.codigo);
      }
      setCancelTarget(null);
      setMotivoCancelacion("");
      refresh();
    } catch (err) {
      setCancelError(normalizeAppError(err, "Error al cancelar la solicitud.").message);
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

  const toggleExpand = (request: CombinedRequest) => {
    const key = getRequestKey(request);
    setExpandedId((previous) => previous === key ? null : key);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">

      {/* ENCABEZADO */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Historial
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            {total > 0 ? `${total} solicitud${total !== 1 ? "es" : ""} reciente${total !== 1 ? "s" : ""} cargada${total !== 1 ? "s" : ""}` : "Sin solicitudes recientes"}
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

      {moduleStates.some((state) => state.error) && (
        <div className="space-y-2" role="status">
          {moduleStates.filter((state) => state.error).map((state) => (
            <div key={state.module} className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="flex-1 font-semibold">{MODULO_CONFIG[state.module].label}: {state.error}</span>
              <button type="button" onClick={state.retry} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 font-bold ring-1 ring-rose-200 hover:bg-rose-100">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Reintentar
              </button>
            </div>
          ))}
        </div>
      )}

      {isBackendLimited && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-800">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Se muestran y filtran ?nicamente las solicitudes recientes entregadas por el servidor.
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
                isExpanded={expandedId === getRequestKey(req)}
                onToggle={() => toggleExpand(req)}
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
        {showFullSpinner
          ? <InnerLoading message="Cargando solicitudes..." />
          : requests.length === 0 && !loading
            ? <div className="p-8"><EmptyState message={emptyMessage} /></div>
            : <RequestTable
                requests={requests}
                expandedId={expandedId}
                onToggleExpand={toggleExpand}
                onCancelTarget={(r) => setCancelTarget(r)}
              />
        }

        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
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

      {/* Modal de Cancelación */}
      {cancelTarget && (
        <CancelModal
          cancelTarget={cancelTarget}
          motivoCancelacion={motivoCancelacion}
          setMotivoCancelacion={setMotivoCancelacion}
          submittingCancel={submittingCancel}
          cancelError={cancelError}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}
