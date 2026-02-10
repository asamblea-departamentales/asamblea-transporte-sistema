// src/services/transport-requests.service.ts
import { api } from "../lib/axios";

export type EstadoSolicitud =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "FINALIZADA"
  | string;

export type SolicitudTransporte = {
  id?: number | string;
  code: string;

  estado: EstadoSolicitud;

  motivo_actividad?: string;
  origen?: string;
  destino?: string;

  fecha_salida?: string; // ISO o "YYYY-MM-DD"
  fecha_retorno?: string | null;

  cantidad_personas?: number;
  prioridad?: string;

  unidad?: {
    id?: number | string;
    nombre?: string;
  };

  solicitante?: {
    id?: number | string;
    name?: string;
    email?: string;
  };

  created_at?: string;
  updated_at?: string;
};

type PaginateMeta = {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number | null;
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

function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data; // paginate => data.data
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

// ✅ Listado (tu backend devuelve paginate(10))
// Si solo quieres array (sin meta), usa getMyRequests()
export async function getMyRequests(): Promise<SolicitudTransporte[]> {
  const { data } = await api.get("/api/solicitudes");
  return normalizeArray<SolicitudTransporte>(data);
}

// ✅ Listado con paginación real
export async function getMyRequestsPaginated(page = 1): Promise<Paginated<SolicitudTransporte>> {
  const { data } = await api.get("/api/solicitudes", { params: { page } });

  return {
    data: normalizeArray<SolicitudTransporte>(data),
    meta: data?.meta,
    links: data?.links,
  };
}

// ✅ DETALLE: por ID (Route Model Binding)
export async function getSolicitudById(id: string | number): Promise<SolicitudTransporte> {
  const { data } = await api.get(`/api/solicitudes/${encodeURIComponent(String(id))}`);
  return (data?.data ?? data) as SolicitudTransporte;
}

// ✅ FINALIZAR: por ID (Route Model Binding)
export async function finalizarSolicitudById(id: string | number): Promise<SolicitudTransporte> {
  const { data } = await api.post(`/api/solicitudes/${encodeURIComponent(String(id))}/finalizar`);
  return (data?.data ?? data) as SolicitudTransporte;
}

/**
 * ✅ COMPAT opcional:
 * Si en el frontend aún tienes "code" y no quieres tocar backend,
 * este método busca el ID dentro del listado y luego llama al detalle por ID.
 *
 * Útil si no tienes endpoint backend por code.
 */
export async function getSolicitudByCode(code: string): Promise<SolicitudTransporte> {
  const list = await getMyRequests();
  const found = list.find((x) => x.code === code);

  if (!found?.id) {
    throw new Error("No se encontró la solicitud por código (no viene ID en el listado).");
  }

  return getSolicitudById(found.id);
}

/**
 * ✅ COMPAT opcional:
 * Finalizar usando code => resolver ID desde listado.
 */
export async function finalizarSolicitud(code: string): Promise<SolicitudTransporte> {
  const list = await getMyRequests();
  const found = list.find((x) => x.code === code);

  if (!found?.id) {
    throw new Error("No se encontró la solicitud por código (no viene ID en el listado).");
  }

  return finalizarSolicitudById(found.id);
}
