// src/services/transport-requests.service.ts
import { api } from "../lib/axios";

export type TransportRequestStatus = "pendiente" | "aprobada" | "rechazada" | "finalizada" | string;

export type TransportRequest = {
  id?: string | number;
  code: string;
  date: string;
  type: string;
  status: TransportRequestStatus;

  // campos opcionales (según tu backend)
  origin?: string;
  encargado?: string;
  subencargado?: string;
  pasajeros?: string | number;
  destinos?: { id?: string; address: string }[];
};

function normalizeArrayResponse<T>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getMyRequests(): Promise<TransportRequest[]> {
  const { data } = await api.get("/api/solicitudes/recientes");
  return normalizeArrayResponse<TransportRequest>(data);
}

/**
 * ✅ Intenta endpoint real de detalle:
 *   GET /api/solicitudes/{code}
 * Si no existe todavía, cae al "plan B": busca en recientes.
 */
export async function getRequestByCode(code: string): Promise<TransportRequest> {
  try {
    const { data } = await api.get(`/api/solicitudes/${encodeURIComponent(code)}`);
    // soporta {data:{...}} o {...}
    return (data?.data ?? data) as TransportRequest;
  } catch {
    // fallback temporal: buscar en recientes
    const list = await getMyRequests();
    const found = list.find((x) => String(x.code).toLowerCase() === String(code).toLowerCase());
    if (!found) throw new Error("No se encontró la solicitud.");
    return found;
  }
}

/**
 * 🚧 Finalizar (solo si tu backend existe)
 * Ideal:
 *   POST /api/solicitudes/{code}/finalizar
 * o PATCH /api/solicitudes/{code} { status: "finalizada" }
 */
export async function finalizeRequest(code: string): Promise<void> {
  // 👇 Cambia esta ruta cuando tengas el backend listo
  await api.post(`/api/solicitudes/${encodeURIComponent(code)}/finalizar`);
}
