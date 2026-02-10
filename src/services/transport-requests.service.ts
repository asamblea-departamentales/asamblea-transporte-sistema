// src/services/transport-requests.service.ts
import { api } from "../lib/axios";

export type TransportRequestStatus = "pendiente" | "aprobada" | "rechazada" | string;

export type TransportRequest = {
  id?: string | number;
  code: string;
  date: string;
  type: string;
  status: TransportRequestStatus;
};

function normalizeArrayResponse<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

/**
 * ✅ Backend actual (temporal)
 * Cuando tengas endpoint real, cambias a:
 *   const {data} = await api.get("/api/solicitudes");
 */
export async function getMyRequests(): Promise<TransportRequest[]> {
  const { data } = await api.get("/api/solicitudes/recientes");
  return normalizeArrayResponse<TransportRequest>(data);
}
