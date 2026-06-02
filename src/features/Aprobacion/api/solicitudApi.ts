import { axiosClient } from '../../../shared/api/axiosClient';
import { ComparativaResponse } from '../types';

export const solicitudApi = {
  getComparativa: async (id: string): Promise<ComparativaResponse> => {
    const response = await axiosClient.get<ComparativaResponse>(`/solicitudes-transporte/${id}/comparativa`);
    return response.data;
  },

  aprobarConDecision: async (id: string, decision_final: 'operativo' | 'sistema', comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${id}/aprobar-con-decision`, {
      decision_final,
      comentario
    });
    return response.data;
  },

  desbloquear: async (id: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${id}/desbloquear`);
    return response.data;
  },

  programar: async (id: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${id}/programar`);
    return response.data;
  },

  rechazar: async (id: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${id}/rechazar`, { comentario });
    return response.data;
  }
};
