import { axiosClient } from '@/shared/api/axiosClient';
import { extractArrayData, mapToRecentRequest } from '@/shared/api/apiMapper';

export interface DashboardSummary {
  pending: number;
  in_progress: number;
  accepted: number;
  completed: number;
  by_module?: {
    transporte: { pending: number; in_progress: number; accepted: number; completed: number; };
    mantenimiento: { pending: number; in_progress: number; accepted: number; completed: number; };
    combustible: { pending: number; in_progress: number; accepted: number; completed: number; };
  };
}

export interface RecentRequest {
  id: string | number;
  code: string;
  ticket?: string;
  date: string;
  rawDate?: string;
  type: string;
  status: string;
}

export const dashboardApi = {
  getSummary: async (signal?: AbortSignal): Promise<DashboardSummary> => {
    const response = await axiosClient.get<DashboardSummary>('/dashboard/summary', { signal });
    return response.data;
  },
  getRecentRequests: async (signal?: AbortSignal): Promise<{ data: RecentRequest[] }> => {
    const response = await axiosClient.get('/solicitudes/recientes', { signal });
    const rawData = extractArrayData(response.data);
    const mappedData = rawData
      .map(mapToRecentRequest)
      .filter((item): item is RecentRequest => item !== null);
    return { data: mappedData };
  },
  getHistorialJefatura: async (signal?: AbortSignal): Promise<{ data: RecentRequest[] }> => {
    const response = await axiosClient.get('/solicitudes/historial-jefatura', { signal });
    const rawData = extractArrayData(response.data);
    const mappedData = rawData
      .map(mapToRecentRequest)
      .filter((item): item is RecentRequest => item !== null);
    return { data: mappedData };
  }
};
