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

export async function getRecentRequests(): Promise<RecentRequest[]> {
  const { data } = await api.get("/api/solicitudes/recientes");
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/api/dashboard/summary");
  return data;
}