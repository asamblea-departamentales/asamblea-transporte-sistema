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

  fecha_salida?: string;  // ISO o "YYYY-MM-DD"
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

function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getMyRequests(): Promise<SolicitudTransporte[]> {
  // Si ya tienes index real /api/solicitudes, usa eso.
  // Por tu controller existe: index() => paginate(10)
  const { data } = await api.get("/api/solicitudes");

  // paginate => { data: [...], links, meta }
  return normalizeArray<SolicitudTransporte>(data);
}

export async function getSolicitudByCode(code: string): Promise<SolicitudTransporte> {
  const { data } = await api.get(`/api/solicitudes/${encodeURIComponent(code)}`);
  return (data?.data ?? data) as SolicitudTransporte;
}

export async function finalizarSolicitud(code: string): Promise<SolicitudTransporte> {
  const { data } = await api.post(`/api/solicitudes/${encodeURIComponent(code)}/finalizar`);
  return (data?.data ?? data) as SolicitudTransporte;
}
