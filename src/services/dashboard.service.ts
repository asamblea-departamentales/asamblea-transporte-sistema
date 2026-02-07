// src/services/dashboard.service.ts
import { api } from "../lib/axios";

export type DashboardSummary = {
  pending: number;
  in_progress: number;
  accepted: number;
  completed: number;
};

export type RecentRequest = {
  code: string;
  date: string;
  type: string;
  status: string;
};

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/api/dashboard/summary");
  return data;
}

export async function getRecentRequests() {
  const { data } = await api.get<RecentRequest[]>("/api/solicitudes/recientes");
  return data;
}
