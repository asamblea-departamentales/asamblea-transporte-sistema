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

  // Fetch todas las solicitudes (sin paginación server-side para poder combinarlas)
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const BIG = 1000; // traemos más registros de una vez

      const [transporte, mantenimiento, combustible] = await Promise.allSettled([
        getAllRequests({ per_page: BIG, page: 1 }),
        getAllMantenimientos({ per_page: BIG, page: 1 }),
        getAllCombustibles({ per_page: BIG, page: 1 }),
      ]);

      const combined: CombinedRequest[] = [];

      if (transporte.status === "fulfilled") {
        transporte.value.data.forEach((s) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            estado:      s.estado,
            created_at:  s.created_at,
            updated_at:  s.updated_at,
            fecha_salida: s.fecha_salida,
            origen:      s.origen,
            destino:     s.destino,
            unidad:      s.unidad,
            solicitante: s.solicitante,
            modulo:      "transporte",
            motorista:   s.motorista,
            vehiculo:    s.vehiculo,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });
      }

      if (mantenimiento.status === "fulfilled") {
        mantenimiento.value.data.forEach((s) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            estado:      s.estado,
            created_at:  s.created_at,
            updated_at:  s.updated_at,
            fecha_salida: s.fecha_salida,
            origen:      s.origen,
            destino:     s.destino,
            unidad:      s.unidad,
            solicitante: s.solicitante,
            modulo:      "mantenimiento",
            motorista:   (s as any).motorista,
            vehiculo:    (s as any).vehiculo,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });
      }

      if (combustible.status === "fulfilled") {
        // Tipo explícito para evitar TS7006 (parameter implicitly has 'any' type)
        combustible.value.data.forEach((s: SolicitudCombustibleNormalizada) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            estado:      s.estado as RequestStatus,
            created_at:  s.created_at,
            updated_at:  s.updated_at,
            fecha_salida: s.fecha_salida,
            origen:      s.origen,
            destino:     s.destino,
            unidad:      s.unidad,
            solicitante: s.solicitante
              ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email }
              : undefined,
            modulo:      "combustible",
            motorista:   s.motorista,
            vehiculo:    s.vehiculo,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });
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
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Filtrado client-side ────────────────────────────────────────────────────

  const filtered = allItems.filter((item) => {
    if (filters.estado && item.estado !== filters.estado) return false;
    if (filters.modulo && item.modulo !== filters.modulo) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        item.codigo.toLowerCase().includes(q) ||
        item.origen.toLowerCase().includes(q) ||
        item.destino.toLowerCase().includes(q)
      );
    }
    return true;
  });

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