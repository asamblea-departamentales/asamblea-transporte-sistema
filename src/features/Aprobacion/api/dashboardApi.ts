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
      // Intentamos llamar al nuevo endpoint dedicado
      const response = await axiosClient.get<{ data: RecentRequest[] }>('/solicitudes/historial-jefatura');
      const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      return { data: rawData };
    } catch (_e) {
      // Fallback temporal: usar el endpoint de recientes
      try {
        const response = await axiosClient.get('/solicitudes/recientes');
        const rawData: RecentRequest[] = Array.isArray(response.data)
          ? response.data
          : (response.data?.data || []);

        // Filtrar: excluir pre_aprobadas (esas son para la pantalla de "Por Aprobar")
        const filteredData = rawData.filter((req: RecentRequest) => {
          if (!req.status) return false;
          const statusVal = typeof req.status === 'string' ? req.status : (req.status as any).value || '';
          const s = statusVal.toLowerCase();
          // Excluir pre_aprobada primero (contiene la palabra "aprobada")
          if (s.includes('pre')) return false;
          return s.includes('aprobada') || s.includes('rechazada') || s.includes('programada') || s.includes('completada');
        });

        return { data: filteredData };
      } catch (_e2) {
        // Si todo falla, devolvemos vacío para no crashear
        return { data: [] };
      }
    }
  }
};
