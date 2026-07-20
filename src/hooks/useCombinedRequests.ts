import { useEffect, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { normalizeAppError } from "../lib/appError";
import { queryKeys } from "../lib/queryKeys";
import { getAllRequests, type Request, type RequestFilters, type RequestStatus } from "../services/requests.service";
import { getAllMantenimientos } from "../services/mantenimiento.service";
import { getAllCombustibles, type EstadoCombustible, type SolicitudCombustibleNormalizada } from "../services/combustible.service";
import { normalizeRequestStatus } from "../lib/requestIdentity";

export type Modulo = "transporte" | "mantenimiento" | "combustible";
export type CombinedRequest = {
  id: number; codigo: string; estado: RequestStatus; created_at: string; updated_at: string;
  fecha_salida: string; origen: string; destino: string; modulo: Modulo;
  unidad?: { id: number; nombre: string };
  solicitante?: { id: number; name: string; email: string };
  motorista?: { id: number; nombre: string } | null;
  vehiculo?: { id: number; placa: string } | null;
  _raw: Record<string, unknown>;
};
export type CombinedFilters = { estado: RequestStatus | ""; modulo: Modulo | ""; search: string };
export type ModuleLoadState = { module: Modulo; loading: boolean; error: string | null; retry: () => void };
type PageResult = { data: CombinedRequest[]; total: number; page: number; per_page: number; total_pages: number };
type MantenimientoItem = Awaited<ReturnType<typeof getAllMantenimientos>>["data"][number] & {
  motorista?: { id: number; nombre: string } | null;
  vehiculo?: { id: number; placa: string } | null;
};
export interface RequestModuleAdapter {
  module: Modulo;
  fetchPage(filters: RequestFilters): Promise<PageResult>;
}

const PER_PAGE = 10;
const COMBUSTIBLE_STATES: readonly string[] = [
  "borrador", "pendiente", "en_revision", "pre_aprobada", "aprobada", "asignada", "rechazada", "completada", "cancelada", "liquidada",
];
const toRecord = (value: object): Record<string, unknown> => Object.fromEntries(Object.entries(value));
const isCombustibleStatus = (value: RequestStatus | undefined): value is EstadoCombustible =>
  !!value && COMBUSTIBLE_STATES.includes(value);
const person = (value?: { id: number; name: string; email: string }) => value
  ? { id: value.id, name: value.name, email: value.email }
  : undefined;

export function normalizeTransporte(value: Request): CombinedRequest {
  return {
    id: value.id, codigo: value.codigo, destino: value.destino, fecha_salida: value.fecha_salida,
    estado: value.estado, origen: value.origen, unidad: value.unidad, solicitante: person(value.solicitante),
    modulo: "transporte", motorista: value.motorista,
    vehiculo: value.vehiculo ? { id: value.vehiculo.id, placa: value.vehiculo.placa } : null,
    created_at: value.created_at || value.fecha_salida, updated_at: value.updated_at, _raw: toRecord(value),
  };
}

export function normalizeMantenimiento(value: MantenimientoItem): CombinedRequest {
  return {
    id: value.id, codigo: value.codigo, destino: value.destino, fecha_salida: value.fecha_salida,
    estado: value.estado, origen: value.origen, unidad: value.unidad, solicitante: person(value.solicitante),
    modulo: "mantenimiento", motorista: value.motorista,
    vehiculo: value.vehiculo ? { id: value.vehiculo.id, placa: value.vehiculo.placa } : null,
    created_at: value.created_at || value.fecha_salida, updated_at: value.updated_at, _raw: toRecord(value),
  };
}

export function normalizeCombustible(value: SolicitudCombustibleNormalizada): CombinedRequest {
  return {
    id: value.id, codigo: value.codigo, destino: value.destino, fecha_salida: value.fecha_salida,
    estado: value.estado, origen: value.origen, unidad: value.unidad, solicitante: person(value.solicitante ?? undefined),
    modulo: "combustible", motorista: value.motorista, vehiculo: value.vehiculo,
    created_at: value.created_at || value.fecha_salida, updated_at: value.updated_at, _raw: toRecord(value),
  };
}

export const requestModuleAdapters: readonly RequestModuleAdapter[] = [
  {
    module: "transporte",
    fetchPage: async (filters) => {
      const result = await getAllRequests(filters);
      return { ...result, data: result.data.map(normalizeTransporte) };
    },
  },
  {
    module: "mantenimiento",
    fetchPage: async (filters) => {
      const result = await getAllMantenimientos(filters);
      return { ...result, data: result.data.map(normalizeMantenimiento) };
    },
  },
  {
    module: "combustible",
    fetchPage: async (filters) => {
      const result = await getAllCombustibles({
        page: filters.page, per_page: filters.per_page, search: filters.search,
        estado: isCombustibleStatus(filters.estado) ? filters.estado : undefined,
      });
      return { ...result, data: result.data.map(normalizeCombustible) };
    },
  },
];

const sortByDate = (items: CombinedRequest[]) => [...items].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
);

export function useCombinedRequests() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<CombinedFilters>({ estado: "", modulo: "", search: "" });
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((current) => ({ ...current, search: searchInput })); setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  const apiFilters: RequestFilters = {
    per_page: PER_PAGE, page, estado: filters.estado || undefined, search: filters.search || undefined,
  };
  const enabled = requestModuleAdapters.map((adapter) => !filters.modulo || filters.modulo === adapter.module);
  const queries = useQueries({ queries: requestModuleAdapters.map((adapter, index) => ({
    queryKey: queryKeys.requests(adapter.module, apiFilters),
    queryFn: () => adapter.fetchPage(apiFilters), enabled: enabled[index], staleTime: 60_000,
  })) });
  const activeQueries = queries.filter((_, index) => enabled[index]);
  const loadedRequests = sortByDate(activeQueries.flatMap((query) => query.data?.data ?? []));
  const normalizedSearch = filters.search.trim().toLocaleLowerCase("es");
  const requests = loadedRequests.filter((request) => {
    const matchesStatus = !filters.estado
      || normalizeRequestStatus(request.estado) === normalizeRequestStatus(filters.estado);
    const haystack = [request.codigo, request.origen, request.destino, request.unidad?.nombre]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("es");
    return matchesStatus && (!normalizedSearch || haystack.includes(normalizedSearch));
  });
  const selectedIndex = filters.modulo
    ? requestModuleAdapters.findIndex((adapter) => adapter.module === filters.modulo)
    : -1;
  const selectedResult = selectedIndex >= 0 ? queries[selectedIndex].data : undefined;
  const loading = activeQueries.some((query) => query.isLoading);
  const loadedQueries = activeQueries.filter((query) => query.isSuccess).length;
  const firstError = activeQueries.find((query) => query.error)?.error;
  const hasClientFilters = Boolean(filters.estado || filters.search);
  const total = hasClientFilters ? requests.length : selectedResult?.total ?? requests.length;
  const totalPages = hasClientFilters ? 1 : selectedResult?.total_pages ?? 1;
  const moduleStates: ModuleLoadState[] = requestModuleAdapters.map((adapter, index) => ({
    module: adapter.module, loading: enabled[index] && queries[index].isLoading,
    error: queries[index].error ? normalizeAppError(queries[index].error).message : null,
    retry: () => { void queries[index].refetch(); },
  }));

  const handleEstadoChange = (estado: RequestStatus | "") => {
    setFilters((current) => ({ ...current, estado })); setPage(1);
  };
  const handleModuloChange = (modulo: Modulo | "") => {
    setFilters((current) => ({ ...current, modulo })); setPage(1);
  };
  const clearFilters = () => {
    setFilters({ estado: "", modulo: "", search: "" }); setSearchInput(""); setPage(1);
  };
  const refresh = () => activeQueries.forEach((query) => { void query.refetch(); });

  return {
    loading, isPartiallyLoaded: loadedQueries > 0 && loadedQueries < activeQueries.length,
    error: firstError ? normalizeAppError(firstError).message : null,
    requests, total, totalPages, page: Math.min(page, Math.max(1, totalPages)), filters, searchInput, moduleStates,
    isBackendLimited: !filters.modulo || hasClientFilters,
    setPage, setSearchInput, handleEstadoChange, handleModuloChange, clearFilters, refresh,
  };
}
