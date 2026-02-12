// src/services/requests.service.ts
import { api } from "../lib/axios";

export type EstadoSolicitud =
  | "BORRADOR"
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA"
  | "PROGRAMADA"
  | "EN_EJECUCION"
  | "COMPLETADA"
  | "FINALIZADA"
  | string;

export type Request = {
  id: number;
  codigo: string;
  estado: EstadoSolicitud;

  motivo_actividad?: string;
  origen?: string;
  destino?: string;

  fecha_salida?: string;
  fecha_retorno?: string | null;

  cantidad_personas?: number;
  prioridad?: string;

  unidad?: { id?: number | string; nombre?: string };
  solicitante?: { id?: number | string; name?: string; email?: string };

  created_at?: string;
  updated_at?: string;
};

export type Paginated<T> = {
  data: T[];
  meta?: any;
  links?: any;
};

const BASE = "/transport-requests";

function normalizeArray<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getAllRequests(params?: {
  page?: number;
  per_page?: number;
}): Promise<Paginated<Request>> {
  const { data } = await api.get(BASE, { params });
  return {
    data: normalizeArray<Request>(data),
    meta: data?.meta,
    links: data?.links,
  };
}

export type FinalizarPayload = {
  observacion?: string;
  fecha_retorno?: string | null;
  // Si tu backend exige más campos, agrégalos aquí:
  // km_final?: number;
};

function getAxiosErrorMessage(err: any): string {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (typeof err?.response?.data === "string" ? err.response.data : null) ||
    err?.message;

  // Si viene con errors (422), intenta mostrar el primer error
  const errors = err?.response?.data?.errors;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const first = firstKey ? errors[firstKey]?.[0] : null;
    if (first) return String(first);
  }

  return msg || "Error en la solicitud.";
}

// ✅ Finalizar (POST /transport-requests/{id}/finalizar) con body
export async function completeRequest(
  id: number,
  payload: FinalizarPayload = {}
): Promise<Request> {
  try {
    const { data } = await api.post(`${BASE}/${id}/finalizar`, payload);
    return (data?.data ?? data) as Request;
  } catch (err: any) {
    throw new Error(getAxiosErrorMessage(err));
  }
}
