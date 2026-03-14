// src/services/transport-requests.service.ts
import { api } from "../lib/axios";

export type EstadoSolicitud =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "FINALIZADA"
  | "PROGRAMADA"
  | string;

export type SolicitudTransporte = {
  id?: number | string;
  code?: string;

  estado: EstadoSolicitud;

  motivo_actividad?: string;
  origen?: string;
  destino?: string;

  fecha_salida?: string; // ISO o YYYY-MM-DD
  fecha_retorno?: string | null;

  cantidad_personas?: number;
  prioridad?: string;

  unidad?: { id?: number | string; nombre?: string };
  solicitante?: { id?: number | string; name?: string; email?: string };

  created_at?: string;
  updated_at?: string;
};

type PaginateMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

type PaginateLinks = {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta?: PaginateMeta;
  links?: PaginateLinks;
};

/**
 * ✅ Si tu axios baseURL ya incluye "/api"
 * Ej: https://dominio.com/api
 * entonces aquí NO vuelvas a poner "/api"
 */
const BASE = "/transport-requests";

function normalizeArray<T>(data: T[] | { data: T[] } | { items: T[] } | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if ("data" in data && Array.isArray(data.data)) return data.data; // paginate => data.data
  if ("items" in data && Array.isArray(data.items)) return data.items;
  return [];
}

/** Listado paginado */
export async function getRequestsPaginated(
  page = 1
): Promise<Paginated<SolicitudTransporte>> {
  const { data } = await api.get(BASE, { params: { page } });

  return {
    data: normalizeArray<SolicitudTransporte>(data),
    meta: data?.meta,
    links: data?.links,
  };
}

/** Detalle por ID */
export async function getRequestById(
  id: string | number
): Promise<SolicitudTransporte> {
  const { data } = await api.get(`${BASE}/${encodeURIComponent(String(id))}`);
  return (data?.data ?? data) as SolicitudTransporte;
}

/**
 * ✅ Finalizar: tu backend suele validar campos => si no mandas body te da 422.
 * Ajusta los campos según lo que tu backend pida en Request::validate(...)
 */
export type FinalizarPayload = {
  observacion?: string;
  fecha_retorno?: string | null; // "YYYY-MM-DD" o ISO
  // agrega aquí si el backend exige más:
  // km_final?: number;
  // combustible_final?: number;
};

export async function finalizarRequestById(
  id: string | number,
  payload: FinalizarPayload = {}
): Promise<SolicitudTransporte> {
  const { data } = await api.post(
    `${BASE}/${encodeURIComponent(String(id))}/finalizar`,
    payload
  );
  return (data?.data ?? data) as SolicitudTransporte;
}
//Hola