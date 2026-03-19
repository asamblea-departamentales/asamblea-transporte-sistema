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
      const BIG = 1000;

      const apiFilters = {
        per_page: BIG,
        page: 1,
        estado: filters.estado || undefined,
        search: filters.search || undefined,
      };

      const [transporte, mantenimiento, combustible] = await Promise.allSettled([
        getAllRequests(apiFilters),
        getAllMantenimientos(apiFilters),
        getAllCombustibles(apiFilters as any),
      ]);

      const combined: CombinedRequest[] = [];

      // 1. Transporte
      if (transporte.status === "fulfilled") {
        transporte.value.data.forEach((s) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            destino:     s.destino,
            fecha_salida: s.fecha_salida,
            estado:      s.estado as RequestStatus,
            origen:      s.origen,
            unidad:      s.unidad,
            solicitante: s.solicitante,
            modulo:      "transporte",
            motorista:   s.motorista,
            vehiculo:    s.vehiculo,
            created_at:  (s as any).created_at || s.fecha_salida,
            updated_at:  s.updated_at,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });

        // Si hay más páginas y no hemos llegado a 1000, pidiéramos más, but BIG is 1000.
        // Si el backend limitó a 15-50, pedimos unas cuantas páginas más.
        if (transporte.value.total > transporte.value.data.length && transporte.value.data.length < 500) {
          try {
            const p2 = await getAllRequests({ ...apiFilters, page: 2 });
            p2.data.forEach(s => combined.push({ ...s, modulo: "transporte", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p3 = await getAllRequests({ ...apiFilters, page: 3 });
            p3.data.forEach(s => combined.push({ ...s, modulo: "transporte", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p4 = await getAllRequests({ ...apiFilters, page: 4 });
            p4.data.forEach(s => combined.push({ ...s, modulo: "transporte", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p5 = await getAllRequests({ ...apiFilters, page: 5 });
            p5.data.forEach(s => combined.push({ ...s, modulo: "transporte", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
          } catch(e) { console.warn("Failed to fetch more transporte pages", e); }
        }
      }

      // 2. Mantenimiento
      if (mantenimiento.status === "fulfilled") {
        mantenimiento.value.data.forEach((s) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            destino:     s.destino,
            fecha_salida: s.fecha_salida,
            estado:      s.estado as RequestStatus,
            origen:      s.origen,
            unidad:      s.unidad,
            solicitante: s.solicitante,
            modulo:      "mantenimiento",
            motorista:   (s as any).motorista,
            vehiculo:    (s as any).vehiculo,
            created_at:  (s as any).created_at || s.fecha_salida,
            updated_at:  s.updated_at,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });

        if (mantenimiento.value.total > mantenimiento.value.data.length && mantenimiento.value.data.length < 500) {
          try {
            const p2 = await getAllMantenimientos({ ...apiFilters, page: 2 });
            p2.data.forEach(s => combined.push({ ...s, modulo: "mantenimiento", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p3 = await getAllMantenimientos({ ...apiFilters, page: 3 });
            p3.data.forEach(s => combined.push({ ...s, modulo: "mantenimiento", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p4 = await getAllMantenimientos({ ...apiFilters, page: 4 });
            p4.data.forEach(s => combined.push({ ...s, modulo: "mantenimiento", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
            const p5 = await getAllMantenimientos({ ...apiFilters, page: 5 });
            p5.data.forEach(s => combined.push({ ...s, modulo: "mantenimiento", created_at: (s as any).created_at || s.fecha_salida, fecha_salida: s.fecha_salida, estado: s.estado as RequestStatus } as any));
          } catch(e) { console.warn("Failed to fetch more mantenimiento pages", e); }
        }
      }

      // 3. Combustible
      if (combustible.status === "fulfilled") {
        // Tipo explícito para evitar TS7006 (parameter implicitly has 'any' type)
        combustible.value.data.forEach((s: SolicitudCombustibleNormalizada) => {
          combined.push({
            id:          s.id,
            codigo:      s.codigo,
            destino:     s.destino,
            fecha_salida: s.fecha_salida,
            estado:      s.estado as RequestStatus,
            origen:      s.origen,
            unidad:      s.unidad,
            solicitante: s.solicitante
              ? { id: s.solicitante.id, name: s.solicitante.name, email: s.solicitante.email }
              : undefined,
            modulo:      "combustible",
            motorista:   s.motorista,
            vehiculo:    s.vehiculo,
            created_at:  (s as any).created_at || s.fecha_salida,
            updated_at:  s.updated_at,
            _raw:        s as unknown as Record<string, unknown>,
          });
        });

        if (combustible.value.total > combustible.value.data.length && combustible.value.data.length < 500) {
          try {
            const p2 = await getAllCombustibles({ ...apiFilters, page: 2 } as any);
            p2.data.forEach(s => combined.push({ ...s, modulo: "combustible", created_at: (s as any).created_at || (s as any).fecha_salida, fecha_salida: (s as any).fecha_salida, estado: (s as any).estado as RequestStatus } as any));
            const p3 = await getAllCombustibles({ ...apiFilters, page: 3 } as any);
            p3.data.forEach(s => combined.push({ ...s, modulo: "combustible", created_at: (s as any).created_at || (s as any).fecha_salida, fecha_salida: (s as any).fecha_salida, estado: (s as any).estado as RequestStatus } as any));
            const p4 = await getAllCombustibles({ ...apiFilters, page: 4 } as any);
            p4.data.forEach(s => combined.push({ ...s, modulo: "combustible", created_at: (s as any).created_at || (s as any).fecha_salida, fecha_salida: (s as any).fecha_salida, estado: (s as any).estado as RequestStatus } as any));
            const p5 = await getAllCombustibles({ ...apiFilters, page: 5 } as any);
            p5.data.forEach(s => combined.push({ ...s, modulo: "combustible", created_at: (s as any).created_at || (s as any).fecha_salida, fecha_salida: (s as any).fecha_salida, estado: (s as any).estado as RequestStatus } as any));
          } catch(e) { console.warn("Failed to fetch more combustible pages", e); }
        }
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
  }, [filters.estado, filters.search]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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