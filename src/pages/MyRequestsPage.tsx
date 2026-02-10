import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllRequests,
  type Request,
  type RequestFilters,
  type RequestsResponse,
} from "../services/requests.service";

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      <td className="px-6 py-5">
        <div className="h-4 w-32 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-28 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-24 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-36 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5">
        <div className="h-4 w-32 rounded-lg bg-slate-200" />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="ml-auto h-7 w-28 rounded-full bg-slate-200" />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="ml-auto h-8 w-20 rounded-lg bg-slate-200" />
      </td>
    </tr>
  );
}

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<Request[]>([]);
  const [response, setResponse] = useState<RequestsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const filters: RequestFilters = {
          page: currentPage,
          per_page: 10,
        };

        if (statusFilter !== "all") {
          filters.status = statusFilter as any;
        }
        if (typeFilter !== "all") {
          filters.type = typeFilter;
        }
        if (searchTerm.trim()) {
          filters.search = searchTerm.trim();
        }

        const data = await getAllRequests(filters);
        if (!alive) return;
        
        setResponse(data);
        setRequests(data.data);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "No se pudo cargar las solicitudes.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

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
    if (statusLower.includes("completad") || statusLower.includes("finalizad")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-slate-200";
    }
    if (statusLower.includes("rechazad")) {
      return "inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-200";
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
    if (statusLower.includes("progres")) {
      return (
        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const handleViewDetails = (id: string) => {
    navigate(`/solicitud/${id}`);
  };

  const totalPages = response?.total_pages ?? 1;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Mis Solicitudes
          </h1>
          <p className="mt-1.5 text-base text-slate-600">
            {response?.total ?? 0} solicitud{response?.total !== 1 ? "es" : ""} encontrada{response?.total !== 1 ? "s" : ""}
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

      {/* Filters */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-lg shadow-slate-200/50">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <h3 className="text-lg font-black tracking-tight text-slate-900">
            Filtros
          </h3>
        </div>
        
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {/* Search */}
          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por código, tipo o descripción..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pl-11 font-semibold text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <svg
                className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="aprobada">Aprobada</option>
              <option value="aceptada">Aceptada</option>
              <option value="completada">Completada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Todos los tipos</option>
              <option value="Transporte">Transporte</option>
              <option value="Logística">Logística</option>
              <option value="Mensajería">Mensajería</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter("all");
                setTypeFilter("all");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-400"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 backdrop-blur-sm shadow-xl shadow-slate-200/50">
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
                  Tipo
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Origen
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Destino
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Estado
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
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
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-full bg-slate-100 p-4">
                        <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">No se encontraron solicitudes</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {statusFilter !== "all" || typeFilter !== "all" || searchTerm
                            ? "Intenta ajustar los filtros"
                            : "Crea tu primera solicitud para comenzar"}
                        </p>
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
                requests.map((request) => (
                  <tr
                    key={request.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="font-bold text-slate-900">{request.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700">{request.date}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold text-slate-900">{request.type}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-medium text-slate-700">{request.origin ?? "—"}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-medium text-slate-700">{request.destination ?? "—"}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={getStatusBadge(request.status)}>
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleViewDetails(request.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && requests.length > 0 && totalPages > 1 && (
          <div className="border-t border-slate-200 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Página {currentPage} de {totalPages}
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Anterior
                </button>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Siguiente
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}