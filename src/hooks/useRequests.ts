import { useState, useEffect, useCallback } from "react";
import {
  getAllRequests,
  completeRequest,
  type Request,
  type RequestStatus,
  type RequestFilters,
} from "../services/requests.service";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type QueryState = {
  page: number;
  estado: RequestStatus | "";
  search: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
//Hola
export function useRequests() {
  // Un solo objeto de estado para la query → el useEffect solo se dispara UNA vez por cambio
  const [query, setQuery] = useState<QueryState>({ page: 1, estado: "", search: "" });

  const [loading, setLoading]       = useState(true);
  const [requests, setRequests]     = useState<Request[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput]         = useState("");
  const [expandedId, setExpandedId]           = useState<number | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  // ─── Carga de datos ──────────────────────────────────────────────────────────
  const loadRequests = useCallback(async (q: QueryState) => {
    setLoading(true);
    try {
      const params: RequestFilters = { page: q.page, per_page: 10 };
      if (q.estado)        params.estado = q.estado;
      if (q.search.trim()) params.search = q.search.trim();

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

  // Un solo useEffect, un solo punto de disparo
  useEffect(() => {
    loadRequests(query);
  }, [query, loadRequests]);

  // ─── Debounce del buscador ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput }));
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

  // Cambia estado y resetea página en UNA sola actualización
  const handleEstadoChange = (estado: RequestStatus | "") => {
    setExpandedId(null);
    setExpandedRequest(null);
    setQuery((prev) => ({ ...prev, page: 1, estado }));
  };

  // Cambia página sin tocar filtros
  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  return {
    // Estado de UI
    loading,
    requests,
    total,
    totalPages,
    searchInput,
    expandedId,
    expandedRequest,
    // Valores derivados para la UI (compatibilidad con la página)
    page: query.page,
    filters: { estado: query.estado, search: query.search },
    // Handlers
    setSearchInput,
    handleRowClick,
    handleCompleteRequest,
    handleEstadoChange,
    setPage: handlePageChange,
  };
}