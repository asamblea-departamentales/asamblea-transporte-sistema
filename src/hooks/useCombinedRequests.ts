// hooks/useCombinedRequests.ts
import { useState, useEffect, useCallback, useRef } from "react";
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
  // raw data por si la vista de detalle lo necesita
  _raw: Record<string, unknown>;
};

// ─── Filtros ───────────────────────────────────────────────────────────────────

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
    solicitante: s.solicitante
      ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email }
      : undefined,
    modulo: "combustible", motorista: s.motorista, vehiculo: s.vehiculo,
    created_at: (s as any).created_at || s.fecha_salida, updated_at: s.updated_at,
    _raw: s as unknown as Record<string, unknown>,
  };
}

// ─── Función genérica para traer todas las páginas de un endpoint ──────────────

async function fetchAllPages<T>(
  fetcher: (filters: any) => Promise<{ data: T[]; total: number }>,
  apiFilters: any
): Promise<T[]> {
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

// ─── Ordenar por fecha desc ────────────────────────────────────────────────────

function sortByDate(arr: CombinedRequest[]): CombinedRequest[] {
  return [...arr].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useCombinedRequests() {
  const [allItems, setAllItems]       = useState<CombinedRequest[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters]         = useState<CombinedFilters>({
    estado: "",
    modulo: "",
    search: "",
  });

  // Contador para saber cuántos módulos han respondido
  const [modulesLoaded, setModulesLoaded] = useState(0);
  const totalModulesToLoad = useRef(3);

  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: searchInput }));
      setPage(1);
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [searchInput]);

  // Fetch solicitudes — carga incremental (muestra datos conforme llegan)
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAllItems([]);
    setModulesLoaded(0);

    const apiFilters = {
      per_page: 1000,
      page: 1,
      estado: filters.estado || undefined,
      search: filters.search || undefined,
    };

    const moduloFilter = filters.modulo;
    const shouldFetchTransporte    = !moduloFilter || moduloFilter === "transporte";
    const shouldFetchMantenimiento = !moduloFilter || moduloFilter === "mantenimiento";
    const shouldFetchCombustible   = !moduloFilter || moduloFilter === "combustible";

    // Contar cuántos módulos vamos a cargar
    const count = [shouldFetchTransporte, shouldFetchMantenimiento, shouldFetchCombustible]
      .filter(Boolean).length;
    totalModulesToLoad.current = count;

    // Función que agrega resultados conforme llegan y actualiza el estado
    const addResults = (newItems: CombinedRequest[]) => {
      setAllItems((prev) => sortByDate([...prev, ...newItems]));
      setModulesLoaded((prev) => {
        const next = prev + 1;
        if (next >= totalModulesToLoad.current) setLoading(false);
        return next;
      });
    };

    // Lanzar cada módulo de forma independiente — el primero que responda se muestra
    if (shouldFetchTransporte) {
      fetchAllPages(getAllRequests, apiFilters)
        .then((data) => addResults(data.map(normalizeTransporte)))
        .catch(() => addResults([]));
    }

    if (shouldFetchMantenimiento) {
      fetchAllPages(getAllMantenimientos, apiFilters)
        .then((data) => addResults(data.map(normalizeMantenimiento)))
        .catch(() => addResults([]));
    }

    if (shouldFetchCombustible) {
      fetchAllPages(getAllCombustibles as any, apiFilters)
        .then((data: any) =>
          addResults(data.map((s: SolicitudCombustibleNormalizada) => normalizeCombustible(s)))
        )
        .catch(() => addResults([]));
    }

    // Si no hay módulos que cargar (no debería pasar)
    if (count === 0) setLoading(false);
  }, [filters.estado, filters.search, filters.modulo]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Paginación client-side ──────────────────────────────────────────────────

  const total      = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const requests   = allItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ─── Estado de progreso ──────────────────────────────────────────────────────

  const isPartiallyLoaded = modulesLoaded > 0 && modulesLoaded < totalModulesToLoad.current;

  // ─── Handlers ────────────────────────────────────────────────────────────────

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

  return {
    loading,
    isPartiallyLoaded,
    error,
    requests,
    total,
    totalPages,
    page:        safePage,
    filters,
    searchInput,
    setPage,
    setSearchInput,
    handleEstadoChange,
    handleModuloChange,
    clearFilters,
    refresh: fetchAll,
  };
}