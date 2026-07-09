// services/mantenimiento.service.ts
import { api } from "../lib/api";
import type { RequestStatus, Unidad, Solicitante, LaravelPaginatedResponse, RequestFilters } from "./requests.service";

export type TipoMantenimiento = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type SolicitudMantenimiento = {
  id: number;
  codigo: string;
  unidad_solicitante_id: number;
  solicitante_id: number;
  descripcion: string;
  // La API puede devolver el tipo como objeto relacionado o como string
  tipo_mantenimiento?: TipoMantenimiento | string | null;
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
      destino:      (typeof s.tipo_mantenimiento === "object" && s.tipo_mantenimiento !== null)
                      ? s.tipo_mantenimiento.nombre
                      : (s.tipo_mantenimiento as string | null | undefined) ?? "Mantenimiento general",
      fecha_salida: s.fecha_sugerida,
    })),
    total:       data.total,
    page:        data.current_page,
    per_page:    data.per_page,
    total_pages: data.last_page,
  };
}

export async function getMantenimientoById(id: string | number): Promise<SolicitudMantenimiento> {
  const { data } = await api.get<SolicitudMantenimiento>(`/api/solicitudes-mantenimiento/${id}`);
  return {
    ...data,
    modulo: "mantenimiento",
    origen: data.descripcion ?? "—",
    destino: (typeof data.tipo_mantenimiento === "object" && data.tipo_mantenimiento !== null)
      ? data.tipo_mantenimiento.nombre
      : (data.tipo_mantenimiento as string | null | undefined) ?? "Mantenimiento general",
    fecha_salida: data.fecha_sugerida,
  };
}

// ── Finalización ────────────────────────────────────────────────────────────

export type FinalizarMantenimientoPayload = {
  fecha_realizada: string;
  costo_real: number;
  adjuntos: File[];
};

export async function finalizarMantenimiento(
  id: string | number,
  payload: FinalizarMantenimientoPayload
): Promise<{ message: string; data: SolicitudMantenimiento }> {
  const form = new FormData();
  form.append("fecha_realizada", payload.fecha_realizada);
  form.append("costo_real", String(payload.costo_real));

  payload.adjuntos.forEach((file) => {
    form.append("adjuntos[]", file);
  });

  const { data } = await api.post<{ message: string; data: SolicitudMantenimiento }>(
    `/api/solicitudes-mantenimiento/${id}/finalizar`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function cancelarMantenimiento(id: string | number): Promise<{ message: string; data: SolicitudMantenimiento }> {
  const { data } = await api.post<{ message: string; data: SolicitudMantenimiento }>(
    `/api/solicitudes-mantenimiento/${id}/cancelar`
  );
  return data;
}