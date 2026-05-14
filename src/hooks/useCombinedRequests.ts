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
    id: s.id,
    codigo: s.codigo,
    destino: s.destino,
    fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus,
    origen: s.origen,
    unidad: s.unidad,
    solicitante: s.solicitante,
    modulo: "transporte",
    motorista: s.motorista,
    vehiculo: s.vehiculo,
    created_at: s.created_at || s.fecha_salida,
    updated_at: s.updated_at,
    _raw: s as Record<string, unknown>,
  };
}

function normalizeMantenimiento(s: any): CombinedRequest {
  return {
    id: s.id,
    codigo: s.codigo,
    destino: s.destino,
    fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus,
    origen: s.origen,
    unidad: s.unidad,
    solicitante: s.solicitante,
    modulo: "mantenimiento",
    motorista: s.motorista,
    vehiculo: s.vehiculo,
    created_at: s.created_at || s.fecha_salida,
    updated_at: s.updated_at,
    _raw: s as Record<string, unknown>,
  };
}

function normalizeCombustible(s: SolicitudCombustibleNormalizada): CombinedRequest {
  return {
    id: s.id,
    codigo: s.codigo,
    destino: s.destino,
    fecha_salida: s.fecha_salida,
    estado: s.estado as RequestStatus,
    origen: s.origen,
    unidad: s.unidad,
    solicitante: s.solicitante
      ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email }
      : undefined,
    modulo: "combustible",
    motorista: s.motorista,
    vehiculo: s.vehiculo,
    created_at: (s as any).created_at || s.fecha_salida,
    updated_at: s.updated_at,
    _raw: s as unknown as Record<string, unknown>,
  };
}

// ─── Función genérica para traer todas las páginas de un endpoint ──────────────

async function fetchAllPages<T>(
  fetcher: (filters: any) => Promise<{ data: T[]; total: number }>,
  apiFilters: any
): Promise<T[]> {
  // Primera página
  const first = await fetcher({ ...apiFilters, page: 1 });
  const all = [...first.data];

  // Si ya tenemos todos, retornar
  if (all.length >= first.total) return all;

  // Calcular cuántas páginas faltan
  const perPage = first.data.length || PER_PAGE;
  const totalPages = Math.ceil(first.total / perPage);
  const maxPages = Math.min(totalPages, 5); // Límite de 5 páginas máximo

  if (maxPages <= 1) return all;

  // Traer las páginas restantes EN PARALELO (mucho más rápido)
  const pagePromises = [];
  for (let p = 2; p <= maxPages; p++) {
    pagePromises.push(fetcher({ ...apiFilters, page: p }).catch(() => ({ data: [] as T[], total: 0 })));
  }

  const results = await Promise.all(pagePromises);
  results.forEach((r) => all.push(...r.data));

  return all;
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

  // Fetch solicitudes — solo llama a los módulos necesarios
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiFilters = {
        per_page: 1000,
        page: 1,
        estado: filters.estado || undefined,
        search: filters.search || undefined,
      };

      const moduloFilter = filters.modulo;
      const combined: CombinedRequest[] = [];

      // Solo llamar a los endpoints que necesitamos según el filtro de módulo
      const shouldFetchTransporte   = !moduloFilter || moduloFilter === "transporte";
      const shouldFetchMantenimiento = !moduloFilter || moduloFilter === "mantenimiento";
      const shouldFetchCombustible   = !moduloFilter || moduloFilter === "combustible";

      // Lanzar las peticiones en paralelo (solo las necesarias)
      const promises = await Promise.allSettled([
        shouldFetchTransporte
          ? fetchAllPages(getAllRequests, apiFilters)
          : Promise.resolve([]),
        shouldFetchMantenimiento
          ? fetchAllPages(getAllMantenimientos, apiFilters)
          : Promise.resolve([]),
        shouldFetchCombustible
          ? fetchAllPages(getAllCombustibles as any, apiFilters)
          : Promise.resolve([]),
      ]);

      // Normalizar resultados
      if (promises[0].status === "fulfilled") {
        (promises[0].value as any[]).forEach((s) => combined.push(normalizeTransporte(s)));
      }
      if (promises[1].status === "fulfilled") {
        (promises[1].value as any[]).forEach((s) => combined.push(normalizeMantenimiento(s)));
      }
      if (promises[2].status === "fulfilled") {
        (promises[2].value as any[]).forEach((s: SolicitudCombustibleNormalizada) =>
          combined.push(normalizeCombustible(s))
        );
      }

      // Ordenar por fecha de creación desc
      combined.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setAllItems(combined);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Error al cargar solicitudes.");
    } finally {
      setLoading(false);
    }
  }, [filters.estado, filters.search, filters.modulo]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Paginación client-side ──────────────────────────────────────────────────

  const total      = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const requests   = allItems.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

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