import { axiosClient } from '../../../shared/api/axiosClient';

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
  type: string;
  status: string;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await axiosClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
  getRecentRequests: async (): Promise<{ data: RecentRequest[] }> => {
    const response = await axiosClient.get<{ data: RecentRequest[] }>('/solicitudes/recientes');
    return response.data;
  }
};
