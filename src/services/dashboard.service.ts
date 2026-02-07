// src/services/dashboard.service.ts
import { api } from "../lib/axios";

export type DashboardSummary = {
  total_solicitudes?: number;
  pendientes?: number;
  aprobadas?: number;
  rechazadas?: number;
  // o lo que uses en el UI
};

export type RecentRequest = {
  code?: string;
  date?: string;
  type?: string;
  status?: string;
};

// ✅ Acepta ambos formatos: [] o {data: []}
export async function getRecentRequests(): Promise<RecentRequest[]> {
  const { data } = await api.get("/api/solicitudes/recientes");

  // Caso 1: backend manda array directo
  if (Array.isArray(data)) return data;

  // Caso 2: backend manda { data: [] }
  if (data && Array.isArray(data.data)) return data.data;

  // Caso raro: cualquier otra cosa
  return [];
}

export async function getDashboardSummary() {
  const { data } = await api.get("/api/dashboard/summary");
  return data;
}
