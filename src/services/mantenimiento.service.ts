// services/mantenimiento.service.ts
import { api } from "../lib/axios";
import type { RequestStatus, Unidad, Solicitante, LaravelPaginatedResponse, RequestFilters } from "./requests.service";

export type SolicitudMantenimiento = {
  id: number;
  codigo: string;
  unidad_solicitante_id: number;
  solicitante_id: number;
  descripcion: string;
  tipo_mantenimiento?: string | null;
  vehiculo_id?: number | null;
  fecha_sugerida: string;
  prioridad: string;
  estado: RequestStatus;
  created_at: string;
  updated_at: string;
  unidad?: Unidad;
  solicitante?: Solicitante;
  // campos normalizados para la vista unificada
  modulo: "mantenimiento";
  origen: string;   // se mapea desde descripcion
  destino: string;  // se mapea desde tipo_mantenimiento
  fecha_salida: string; // se mapea desde fecha_sugerida
};

type LaravelMantenimientoPaginatedResponse = Omit<LaravelPaginatedResponse, "data"> & {
  data: Omit<SolicitudMantenimiento, "modulo" | "origen" | "destino" | "fecha_salida">[];
};

export type MantenimientoFilters = Pick<RequestFilters, "estado" | "search" | "page" | "per_page">;

export async function getAllMantenimientos(filters?: MantenimientoFilters) {
  const params = new URLSearchParams();
  if (filters?.estado)   params.append("estado",   filters.estado);
  if (filters?.search)   params.append("search",   filters.search);
  if (filters?.page)     params.append("page",     filters.page.toString());
  if (filters?.per_page) params.append("per_page", filters.per_page.toString());

  const { data } = await api.get<LaravelMantenimientoPaginatedResponse>(
    `/api/solicitudes-mantenimiento?${params.toString()}`
  );

  return {
    data: data.data.map((s) => ({
      ...s,
      modulo:       "mantenimiento" as const,
      origen:       s.descripcion ?? "—",
      destino:      s.tipo_mantenimiento ?? "Mantenimiento general",
      fecha_salida: s.fecha_sugerida,
    })),
    total:       data.total,
    page:        data.current_page,
    per_page:    data.per_page,
    total_pages: data.last_page,
  };
}