import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRequests,
  completeRequest,
  type Request,
  type RequestStatus,
  type RequestFilters,
} from "../services/requests.service";

type QueryState = {
  page: number;
  estado: RequestStatus | "";
  search: string;
};

export function useRequests() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<QueryState>({ page: 1, estado: "", search: "" });
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedRequest, setExpandedRequest] = useState<Request | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput }));
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["requests", query],
    queryFn: async () => {
      const params: RequestFilters = { page: query.page, per_page: 10 };
      if (query.estado) params.estado = query.estado;
      if (query.search.trim()) params.search = query.search.trim();
      return await getAllRequests(params);
    },
    staleTime: 60 * 1000,
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => completeRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });

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
    await completeMutation.mutateAsync(id);
    if (expandedRequest?.id === id) {
      setExpandedRequest({ ...expandedRequest, estado: "completada" });
    }
  };

  const handleEstadoChange = (estado: RequestStatus | "") => {
    setExpandedId(null);
    setExpandedRequest(null);
    setQuery((prev) => ({ ...prev, page: 1, estado }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  return {
    loading,
    requests: data?.data || [],
    total: data?.total || 0,
    totalPages: data?.total_pages || 1,
    searchInput,
    expandedId,
    expandedRequest,
    page: query.page,
    filters: { estado: query.estado, search: query.search },
    setSearchInput,
    handleRowClick,
    handleCompleteRequest,
    handleEstadoChange,
    setPage: handlePageChange,
  };
}