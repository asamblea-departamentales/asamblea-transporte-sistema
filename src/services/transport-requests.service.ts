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

const BASE = "/api/transport-requests";

function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data; // paginate => data.data
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getRequestsPaginated(page = 1): Promise<Paginated<SolicitudTransporte>> {
  const { data } = await api.get(BASE, { params: { page } });
  return {
    data: normalizeArray<SolicitudTransporte>(data),
    meta: data?.meta,
    links: data?.links,
  };
}

export async function getRequestById(id: string | number): Promise<SolicitudTransporte> {
  const { data } = await api.get(`${BASE}/${encodeURIComponent(String(id))}`);
  return (data?.data ?? data) as SolicitudTransporte;
}

export async function finalizarRequestById(id: string | number): Promise<SolicitudTransporte> {
  const { data } = await api.post(`${BASE}/${encodeURIComponent(String(id))}/finalizar`);
  return (data?.data ?? data) as SolicitudTransporte;
}
