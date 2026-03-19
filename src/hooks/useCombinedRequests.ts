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

  // Helper para mapear y combinar resultados de la API
  const processResults = (transporte: any, mantenimiento: any, combustible: any) => {
    const combined: CombinedRequest[] = [];
    
    if (transporte.status === "fulfilled") {
      transporte.value.data.forEach((s: any) => {
        combined.push({
          id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
          estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
          solicitante: s.solicitante, modulo: "transporte", motorista: s.motorista,
          vehiculo: s.vehiculo, created_at: s.created_at || s.fecha_salida, updated_at: s.updated_at,
          _raw: s as unknown as Record<string, unknown>,
        });
      });
    }

    if (mantenimiento.status === "fulfilled") {
      mantenimiento.value.data.forEach((s: any) => {
        combined.push({
          id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
          estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
          solicitante: s.solicitante, modulo: "mantenimiento", motorista: s.motorista,
          vehiculo: s.vehiculo, created_at: s.created_at || s.fecha_salida, updated_at: s.updated_at,
          _raw: s as unknown as Record<string, unknown>,
        });
      });
    }

    if (combustible.status === "fulfilled") {
      combustible.value.data.forEach((s: SolicitudCombustibleNormalizada) => {
        combined.push({
          id: s.id, codigo: s.codigo, destino: s.destino, fecha_salida: s.fecha_salida,
          estado: s.estado as RequestStatus, origen: s.origen, unidad: s.unidad,
          solicitante: s.solicitante ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email } : undefined,
          modulo: "combustible", motorista: s.motorista, vehiculo: s.vehiculo,
          created_at: (s as any).created_at || s.fecha_salida, updated_at: s.updated_at,
          _raw: s as unknown as Record<string, unknown>,
        });
      });
    }
    return combined;
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    let active = true;

    try {
      const apiFilters = {
        page: 1,
        estado: filters.estado || undefined,
        search: filters.search || undefined,
      };

      // 1. CARGA RÁPIDA (Primeros 15 de cada módulo)
      const [t1, m1, c1] = await Promise.allSettled([
        getAllRequests({ ...apiFilters, per_page: 15 }),
        getAllMantenimientos({ ...apiFilters, per_page: 15 }),
        getAllCombustibles({ ...apiFilters, per_page: 15 } as any),
      ]);

      if (!active) return;

      let combined = processResults(t1, m1, c1);
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setAllItems(combined);
      setLoading(false); // UI renderiza instantáneamente los primeros resultados

      // 2. CARGA EN SEGUNDO PLANO (El resto de datos)
      // Solo si el usuario no tiene filtros muy restrictivos que ya devolvieron todo
      const hasMoreT = t1.status === "fulfilled" && t1.value.total > t1.value.data.length;
      const hasMoreM = m1.status === "fulfilled" && m1.value.total > m1.value.data.length;
      const hasMoreC = c1.status === "fulfilled" && c1.value.total > c1.value.data.length;

      if (hasMoreT || hasMoreM || hasMoreC) {
        const [tAll, mAll, cAll] = await Promise.allSettled([
          getAllRequests({ ...apiFilters, per_page: 1000 }),
          getAllMantenimientos({ ...apiFilters, per_page: 1000 }),
          getAllCombustibles({ ...apiFilters, per_page: 1000 } as any),
        ]);

        if (!active) return;
        
        const fullCombined = processResults(tAll, mAll, cAll);
        fullCombined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAllItems(fullCombined); // Actualizamos silenciosamente con todo el historial
      }

    } catch (e: unknown) {
      if (active) setError((e as Error)?.message ?? "Error al cargar solicitudes.");
    } finally {
      if (active) setLoading(false);
    }

    return () => { active = false; };
  }, [filters.estado, filters.search]);

  useEffect(() => {
    const cleanup = fetchAll();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [fetchAll]);

  // ─── Filtrado client-side ────────────────────────────────────────────────────

  const filtered = allItems;

  const total      = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const requests   = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

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