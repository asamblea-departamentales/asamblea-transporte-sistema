
//Uso de Filtros para el Historial de Usuarios
import { useState, useCallback, useEffect } from "react";
import {
  getAllRequests,
  completeRequest,
  type Request,
  type RequestStatus,
  type RequestFilters,
} from "../services/requests.service";

type FilterState = {
  estado: RequestStatus | "";
  search: string;
};

export function useRequests() {
  const [loading, setLoading]           = useState(true);
  const [requests, setRequests]         = useState<Request[]>([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [page, setPage]                 = useState(1);
  const [filters, setFilters]           = useState<FilterState>({ estado: "", search: "" });
  const [searchInput, setSearchInput]   = useState("");
  const [expandedId, setExpandedId]     = useState<number | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  // ─── Carga de datos ──────────────────────────────────────────────────────────
  const loadRequests = useCallback(
    async (currentPage: number, currentFilters: FilterState) => {
      setLoading(true);
      try {
        const params: RequestFilters = { page: currentPage, per_page: 10 };
        if (currentFilters.estado)        params.estado = currentFilters.estado;
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
    },
    []
  );

  useEffect(() => {
    loadRequests(page, filters);
  }, [page, filters, loadRequests]);

  // ─── Debounce del buscador ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleRowClick = (req: Request) => {
    if (expandedId === req.id) {
      setExpandedId(null);
      setExpandedRequest(null);
      return;
    }
    setExpandedId(req.id);
    setExpandedRequest(req);
  };

  const handleCompleteRequest = async (id: number) => {
    await completeRequest(id);
    setRequests((curr) =>
      curr.map((r) => (r.id === id ? { ...r, estado: "completada" } : r))
    );
    if (expandedRequest?.id === id) {
      setExpandedRequest({ ...expandedRequest, estado: "completada" });
    }
  };

  const handleEstadoChange = (estado: RequestStatus | "") => {
    setPage(1);
    setExpandedId(null);
    setExpandedRequest(null);
    setFilters((prev) => ({ ...prev, estado }));
  };

  return {
    // Estado
    loading,
    requests,
    total,
    totalPages,
    page,
    filters,
    searchInput,
    expandedId,
    expandedRequest,
    // Setters / handlers
    setPage,
    setSearchInput,
    handleRowClick,
    handleCompleteRequest,
    handleEstadoChange,
  };
}