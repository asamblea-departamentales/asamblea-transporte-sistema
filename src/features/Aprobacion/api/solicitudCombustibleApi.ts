import { axiosClient } from '../../../shared/api/axiosClient';
import { ComparativaCombustibleResponse } from '../types';

export const solicitudCombustibleApi = {
  getComparativa: async (id: string): Promise<ComparativaCombustibleResponse> => {
    const response = await axiosClient.get<ComparativaCombustibleResponse>(`/solicitudes-combustible/${id}/comparativa`);
    return response.data;
  },

  aprobar: async (id: string, comentario?: string) => {
    const payload: any = {};
    if (comentario) payload.comentario = comentario;
    const response = await axiosClient.post(`/solicitudes-combustible/${id}/aprobar`, payload);
    return response.data;
  },

  aprobarConDecision: async (id: string, decision_final: 'mantener' | 'manual', comentario: string, monto_aprobado?: number) => {
    const payload: any = {
      decision_final,
      comentario
    };
    if (decision_final === 'manual' && monto_aprobado !== undefined) {
      payload.monto_aprobado = monto_aprobado;
    }

    const response = await axiosClient.post(`/solicitudes-combustible/${id}/aprobar-con-decision`, payload);
    return response.data;
  },



  rechazar: async (id: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${id}/rechazar`, { comentario });
    return response.data;
  }
};
