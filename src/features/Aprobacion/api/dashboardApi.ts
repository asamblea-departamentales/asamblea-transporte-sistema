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
  rawDate?: string;
  type: string;
  status: string;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await axiosClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },
  getRecentRequests: async (): Promise<{ data: RecentRequest[] }> => {
    const response = await axiosClient.get<{ data: any[] }>('/solicitudes/recientes');
    const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    const mappedData: RecentRequest[] = rawData.map((item: any) => ({
      id: item.id?.toString() || '',
      code: item.codigo || item.code || '',
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : (item.date || ''),
      rawDate: item.created_at || item.date || '',
      type: item.modulo ? (item.modulo.charAt(0).toUpperCase() + item.modulo.slice(1)) : (item.tipo_vehiculo_nombre ? 'Transporte' : (item.type || 'Transporte')),
      status: item.estado || item.status || ''
    }));
    return { data: mappedData };
  },
  // TODO: Reemplazar el endpoint cuando el backend libere /api/solicitudes/historial-jefatura
  getHistorialJefatura: async (): Promise<{ data: RecentRequest[] }> => {
    // Ya no usamos el fallback, forzamos a que llame a historial-jefatura
    const response = await axiosClient.get<{ data: RecentRequest[] }>('/solicitudes/historial-jefatura');
    const rawData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    
    const mappedData: RecentRequest[] = rawData.map((item: any) => ({
      id: item.id?.toString() || '',
      code: item.codigo || item.code || '',
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : (item.date || ''),
      rawDate: item.created_at || item.date || '',
      type: item.tipo_vehiculo_nombre ? 'Transporte' : (item.type || 'Transporte'),
      status: item.estado || item.status || ''
    }));
    
    return { data: mappedData };
  }
};
