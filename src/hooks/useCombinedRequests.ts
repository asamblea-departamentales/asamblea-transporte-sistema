// hooks/useCombinedRequests.ts
import { useState, useEffect, useMemo, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { getAllRequests } from "../services/requests.service";
import { getAllMantenimientos } from "../services/mantenimiento.service";
import { getAllCombustibles } from "../services/combustible.service";
import type { RequestStatus } from "../services/requests.service";
import type { SolicitudCombustibleNormalizada } from "../services/combustible.service";

// ─── Tipo unificado ────────────────────────────────────────────────────────────
export type Modulo = "transporte" | "mantenimiento" | "combustible";

export type CombinedRequest = {
  id: number;
  codigo: string;
  estado: RequestStatus;
  created_at: string;
  updated_at: string;
  fecha_salida: string;
  origen: string;
  destino: string;
  unidad?: { id: number; nombre: string };
  solicitante?: { id: number; name: string; email: string };
  motorista?: { id: number; nombre: string } | null;
  vehiculo?: { id: number; placa: string } | null;
  modulo: Modulo;
  _raw: Record<string, unknown>;
};

export type CombinedFilters = {
  estado: RequestStatus | "";
  modulo: Modulo | "";
  search: string;
};

const PER_PAGE = 10;

// ─── Helpers para normalizar cada módulo ───────────────────────────────────────
function normalizeTransporte(s: any): CombinedRequest {
  return {
    id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
    solicitante: s.solicitante, modulo: "transporte", motorista: s.motorista,
    vehiculo: s.vehiculo, created_at: s.created_at || s.fecha_salida,
    updated_at: s.updated_at, _raw: s as Record<string, unknown>,
  };
}

function normalizeMantenimiento(s: any): CombinedRequest {
  return {
    id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
    solicitante: s.solicitante, modulo: "mantenimiento", motorista: s.motorista,
    vehiculo: s.vehiculo, created_at: s.created_at || s.fecha_salida,
    updated_at: s.updated_at, _raw: s as Record<string, unknown>,
  };
}

function normalizeCombustible(s: SolicitudCombustibleNormalizada): CombinedRequest {
  return {
    id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
    solicitante: s.solicitante ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email } : undefined,
    modulo: "combustible", motorista: s.motorista, vehiculo: s.vehiculo,
    created_at: (s as any).created_at || s.fecha_salida, updated_at: s.updated_at,
    _raw: s as unknown as Record<string, unknown>,
  };
}

async function fetchAllPages<T>(fetcher: (filters: any) => Promise<{ data: T[]; total: number }>, apiFilters: any): Promise<T[]> {
  const first = await fetcher({ ...apiFilters, page: 1 });
  const all = [...first.data];
  if (all.length >= first.total) return all;

  const perPage = first.data.length || PER_PAGE;
  const totalPages = Math.ceil(first.total / perPage);
  const maxPages = Math.min(totalPages, 5);
  if (maxPages <= 1) return all;

  const pagePromises = [];
  for (let p = 2; p <= maxPages; p++) {
    pagePromises.push(fetcher({ ...apiFilters, page: p }).catch(() => ({ data: [] as T[], total: 0 })));
  }
  const results = await Promise.all(pagePromises);
  results.forEach((r) => all.push(...r.data));
  return all;
}

function sortByDate(arr: CombinedRequest[]): CombinedRequest[] {
  return [...arr].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function useCombinedRequests() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<CombinedFilters>({ estado: "", modulo: "", search: "" });

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  const apiFilters = {
    per_page: 1000,
    page: 1,
    estado: filters.estado || undefined,
    search: filters.search || undefined,
  };

  const shouldFetchTransporte = !filters.modulo || filters.modulo === "transporte";
  const shouldFetchMantenimiento = !filters.modulo || filters.modulo === "mantenimiento";
  const shouldFetchCombustible = !filters.modulo || filters.modulo === "combustible";

  const queries = useQueries({
    queries: [
      {
        queryKey: ["transporte-all", apiFilters],
        queryFn: async () => {
          const data = await fetchAllPages(getAllRequests, apiFilters);
          return data.map(normalizeTransporte);
        },
        enabled: shouldFetchTransporte,
        staleTime: 60 * 1000,
      },
      {
        queryKey: ["mantenimiento-all", apiFilters],
        queryFn: async () => {
          const data = await fetchAllPages(getAllMantenimientos, apiFilters);
          return data.map(normalizeMantenimiento);
        },
        enabled: shouldFetchMantenimiento,
        staleTime: 60 * 1000,
      },
      {
        queryKey: ["combustible-all", apiFilters],
        queryFn: async () => {
          const data = await fetchAllPages(getAllCombustibles as any, apiFilters);
          return (data as any[]).map((s) => normalizeCombustible(s));
        },
        enabled: shouldFetchCombustible,
        staleTime: 60 * 1000,
      },
    ],
  });

  const allItems = useMemo(() => {
    const items = queries.flatMap((q) => q.data || []);
    return sortByDate(items);
  }, [queries[0].data, queries[1].data, queries[2].data]);

  const loading = queries.some((q) => q.isLoading && q.fetchStatus !== 'idle');
  
  const expectedQueries = [shouldFetchTransporte, shouldFetchMantenimiento, shouldFetchCombustible].filter(Boolean).length;
  const loadedQueries = queries.filter((q) => q.isSuccess).length;
  const isPartiallyLoaded = loadedQueries > 0 && loadedQueries < expectedQueries;
  const error = queries.find((q) => q.error)?.error?.message || null;

  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const requests = allItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleEstadoChange = (estado: RequestStatus | "") => {
    setFilters((f) => ({ ...f, estado }));
    setPage(1);
  };

  const handleModuloChange = (modulo: Modulo | "") => {
    setFilters((f) => ({ ...f, modulo }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ estado: "", modulo: "", search: "" });
    setSearchInput("");
    setPage(1);
  };

  const refresh = () => {
    queries.forEach(q => q.refetch());
  };

  return {
    loading,
    isPartiallyLoaded,
    error,
    requests,
    total,
    totalPages,
    page: safePage,
    filters,
    searchInput,
    setPage,
    setSearchInput,
    handleEstadoChange,
    handleModuloChange,
    clearFilters,
    refresh,
  };
}