import { apiFetch } from "./apiFetch";

export type DashboardSummary = {
  pending: number;
  in_progress: number;
  accepted: number;
  completed: number;
};

export type RecentRequest = {
  code: string;
  date: string;       // backend puede devolver ISO y tú formateas
  type: string;
  status: string;     // "Aprobado" | "Pendiente" etc
};

export async function getDashboardSummary() {
  // ✅ endpoint ejemplo
  return apiFetch<DashboardSummary>("/api/dashboard/summary");
}

export async function getRecentRequests() {
  // ✅ endpoint ejemplo
  return apiFetch<RecentRequest[]>("/api/solicitudes/recientes");
}
