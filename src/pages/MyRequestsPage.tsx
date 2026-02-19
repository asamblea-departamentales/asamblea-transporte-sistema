import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRequests,
  completeRequest,
  type Request,
  type RequestStatus,
  type RequestFilters,
} from "../services/requests.service";

// ─── TIPOS LOCALES ────────────────────────────────────────────────────────────

type FilterState = {
  estado: RequestStatus | "";
  search: string;
};

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const ESTADOS: { value: RequestStatus | ""; label: string }[] = [
  { value: "",           label: "Todos los estados" },
  { value: "pendiente",  label: "Pendiente"  },
  { value: "aprobada",   label: "Aprobada"   },
  { value: "programada", label: "Programada" },
  { value: "completada", label: "Completada" },
  { value: "finalizada", label: "Finalizada" },
  { value: "rechazada",  label: "Rechazada"  },
  { value: "observada",  label: "Observada"  },
  { value: "borrador",   label: "Borrador"   },
];

const STATUS_STYLES: Record<string, string> = {
  pendiente:  "bg-amber-100 text-amber-700 border-amber-200",
  aprobada:   "bg-emerald-100 text-emerald-700 border-emerald-200",
  programada: "bg-purple-100 text-purple-700 border-purple-200",
  completada: "bg-slate-800 text-white border-slate-600",
  finalizada: "bg-slate-800 text-white border-slate-600",
  rechazada:  "bg-red-100 text-red-700 border-red-200",
  observada:  "bg-blue-100 text-blue-700 border-blue-200",
  borrador:   "bg-gray-100 text-gray-600 border-gray-200",
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-50">
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-slate-100" /></td>
      <td className="px-6 py-4"><div className="ml-auto h-6 w-24 rounded-full bg-slate-100" /></td>
    </tr>
  );
}

// ─── DETALLE EXPANDIDO ────────────────────────────────────────────────────────

function RequestDetailRow({
  request,
  onComplete,
}: {
  request: Request;
  onComplete: (id: number) => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCompleteClick = async () => {
    if (!confirm("¿Confirmas que el viaje ha finalizado y se ha completado?")) return;
    setIsUpdating(true);
    try {
      await onComplete(request.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <tr className="border-b border-slate-100">
      <td colSpan={5} className="px-0 py-0">
        <div className="border-t border-slate-200 bg-slate-50 p-6 shadow-inner">
          <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* Cabecera */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Detalle de Solicitud #{request.codigo}
              </h3>
              {request.estado === "programada" && (
                <button
                  onClick={handleCompleteClick}
                  disabled={isUpdating}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-all
                    ${isUpdating
                      ? "cursor-not-allowed bg-slate-400"
                      : "bg-slate-800 hover:-translate-y-0.5 hover:bg-black hover:shadow-lg"
                    }`}
                >
                  {isUpdating ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Finalizar Viaje
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Ruta */}
              <div>
                <h4 className="mb-2 text-xs font-black uppercase text-slate-500">Ruta</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-green-500" />
                    <div>
                      <span className="block text-xs text-slate-500">Origen</span>
                      <span className="font-medium text-slate-900">{request.origen}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                    <div>
                      <span className="block text-xs text-slate-500">Destino</span>
                      <span className="font-medium text-slate-900">{request.destino}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos generales */}
              <div>
                <h4 className="mb-2 text-xs font-black uppercase text-slate-500">Datos Generales</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-slate-700">Pasajeros:</span> {request.cantidad_personas}</p>
                  <p><span className="font-semibold text-slate-700">Motivo:</span> {request.motivo_actividad}</p>
                  {request.unidad && (
                    <p><span className="font-semibold text-slate-700">Unidad:</span> {request.unidad.nombre}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end text-xs text-slate-400">
              Creado el {formatFecha(request.created_at)}
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function AllRequestsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ estado: "", search: "" });
  const [searchInput, setSearchInput] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  const PER_PAGE = 50; // Trae 50 por página para mostrar el historial completo

  // ── Carga de datos ──
  const loadRequests = useCallback(async (currentPage: number, currentFilters: FilterState) => {
    setLoading(true);
    try {
      const params: RequestFilters = {
        page: currentPage,
        per_page: PER_PAGE,
      };
      if (currentFilters.estado) params.estado = currentFilters.estado;
      if (currentFilters.search.trim()) params.search = currentFilters.search.trim();

      const result = await getAllRequests(params);
      setRequests(result.data);
      setTotal(result.total);
      setTotalPages(result.total_pages);
    } catch {
      setRequests([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests(page, filters);
  }, [page, filters, loadRequests]);

  // ── Debounce del buscador ──
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Expansión de filas ──
  const handleRowClick = (req: Request) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      setExpandedRequest(null);
      return;
    }
    setExpandedId(req.id);
    setExpandedRequest(req);
  };

  // ── Completar solicitud ──
  const handleCompleteRequest = async (id: number) => {
    await completeRequest(id);
    setRequests((current) =>
      current.map((req) => (req.id === id ? { ...req, estado: "completada" } : req))
    );
    if (expandedRequest?.id === id) {
      setExpandedRequest({ ...expandedRequest, estado: "completada" });
    }
  };

  // ── Cambio de filtro de estado ──
  const handleEstadoChange = (estado: RequestStatus | "") => {
    setPage(1);
    setFilters((prev) => ({ ...prev, estado }));
    setExpandedId(null);
    setExpandedRequest(null);
  };

  // ── Paginación ──
  const handlePrevPage = () => setPage((p) => Math.max(1, p - 1));
  const handleNextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="min-h-screen bg-background-light px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ENCABEZADO */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
              Historial de Solicitudes
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {total > 0
                ? `${total} solicitud${total !== 1 ? "es" : ""} en total`
                : "Sin solicitudes registradas"}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ir al Dashboard
          </button>
        </div>

        {/* FILTROS */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            {/* Buscador */}
            <div className="relative flex-1">
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

            {/* Filtro estado */}
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleEstadoChange(opt.value as RequestStatus | "")}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition
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
        </div>

        {/* TABLA */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No hay solicitudes</p>
                        <p className="text-xs text-slate-500">
                          {filters.estado || filters.search
                            ? "Intenta cambiar los filtros de búsqueda."
                            : "Aún no tienes solicitudes registradas."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        onClick={() => handleRowClick(req)}
                        className={`cursor-pointer transition-all hover:bg-slate-50 ${
                          expandedId === req.id ? "bg-slate-50" : ""
                        }`}
                      >
                        {/* Código */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 ring-2 ring-indigo-100" />
                            <span className="font-bold text-slate-900">{req.codigo}</span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-600">
                            {new Date(req.fecha_salida)
                              .toISOString()
                              .slice(0, 16)
                              .replace("T", " ")}
                          </span>
                        </td>

                        {/* Ruta resumida */}
                        <td className="px-6 py-4 max-w-[260px]">
                          <div className="flex items-center gap-1.5 text-sm text-slate-700">
                            <span className="truncate max-w-[110px] font-medium" title={req.origen}>
                              {req.origen}
                            </span>
                            <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="truncate max-w-[110px] font-medium" title={req.destino}>
                              {req.destino}
                            </span>
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900">Transporte</span>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize ${getStatusStyle(req.estado)}`}>
                            {(req.estado === "completada" || req.estado === "finalizada") && (
                              <svg className="mr-1 h-3 w-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {req.estado}
                          </span>
                        </td>
                      </tr>

                      {/* Fila expandida */}
                      {expandedId === req.id && expandedRequest && (
                        <RequestDetailRow
                          request={expandedRequest}
                          onComplete={handleCompleteRequest}
                        />
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              <p className="text-sm text-slate-500">
                Página <span className="font-semibold text-slate-800">{page}</span> de{" "}
                <span className="font-semibold text-slate-800">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <footer className="py-3 text-center text-xs text-slate-400">
          © 2026 Sistema de Transporte Institucional
        </footer>
      </div>
    </div>
  );
}