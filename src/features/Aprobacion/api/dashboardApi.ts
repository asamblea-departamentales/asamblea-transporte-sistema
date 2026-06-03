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
  },
  // TODO: Reemplazar el endpoint cuando el backend libere /api/solicitudes/historial-jefatura
  getHistorialJefatura: async (): Promise<{ data: RecentRequest[] }> => {
    try {
      // Intentamos llamar al nuevo endpoint
      const response = await axiosClient.get<{ data: RecentRequest[] }>('/solicitudes/historial-jefatura');
      return response.data;
    } catch (e) {
      // Fallback temporal: usar el endpoint de recientes y filtrar en frontend
      const response = await axiosClient.get<{ data: RecentRequest[] }>('/solicitudes/recientes');
      
      const filteredData = response.data.data.filter(req => {
        if (!req.status) return false;
        const s = req.status.toLowerCase();
        // Mostrar aprobadas, rechazadas, programadas, completadas
        return !s.includes('pre') && (s.includes('aprobada') || s.includes('rechazada') || s.includes('programada') || s.includes('completada'));
      });
      
      return { data: filteredData };
    }
  }
};
