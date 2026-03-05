// services/combustible.service.ts
import { api } from "../lib/axios";
import type { RequestStatus, Unidad, Solicitante, LaravelPaginatedResponse, RequestFilters } from "./requests.service";

export type TipoCombustible = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SolicitudCombustible = {
  id: number;
  codigo: string;
  unidad_solicitante_id: number;
  solicitante_id: number;
  motivo: string;
  // La API puede devolver el tipo como objeto relacionado o como string
  tipo_combustible?: TipoCombustible | string | null;
  cantidad_solicitada?: number | null;
  vehiculo_placa?: string | null;
  fecha_solicitud: string;
  prioridad: string;
  estado: RequestStatus;
  created_at: string;
  updated_at: string;
  unidad?: Unidad;
  solicitante?: Solicitante;
  // campos normalizados para la vista unificada
  modulo: "combustible";
  origen: string;   // se mapea desde motivo
  destino: string;  // se mapea desde tipo_combustible
  fecha_salida: string; // se mapea desde fecha_solicitud
};

type LaravelCombustiblePaginatedResponse = Omit<LaravelPaginatedResponse, "data"> & {
  data: Omit<SolicitudCombustible, "modulo" | "origen" | "destino" | "fecha_salida">[];
};

export type CombustibleFilters = Pick<RequestFilters, "estado" | "search" | "page" | "per_page">;

export async function getAllCombustibles(filters?: CombustibleFilters) {
  const params = new URLSearchParams();
  if (filters?.estado)   params.append("estado",   filters.estado);
  if (filters?.search)   params.append("search",   filters.search);
  if (filters?.page)     params.append("page",     filters.page.toString());
  if (filters?.per_page) params.append("per_page", filters.per_page.toString());

  const { data } = await api.get<LaravelCombustiblePaginatedResponse>(
    `/api/solicitudes-combustible?${params.toString()}`
  );

  return {
    data: data.data.map((s) => ({
      ...s,
      modulo:       "combustible" as const,
      origen:       s.motivo ?? "—",
      destino:      (typeof s.tipo_combustible === "object" && s.tipo_combustible !== null)
                      ? s.tipo_combustible.nombre
                      : (s.tipo_combustible as string | null | undefined) ?? "Combustible general",
      fecha_salida: s.fecha_solicitud,
    })),
    total:       data.total,
    page:        data.current_page,
    per_page:    data.per_page,
    total_pages: data.last_page,
  };
}