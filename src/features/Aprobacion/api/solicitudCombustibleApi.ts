import { axiosClient } from '../../../shared/api/axiosClient';
import { ComparativaCombustibleResponse } from '../types';

export const solicitudCombustibleApi = {
  getComparativa: async (id: string): Promise<ComparativaCombustibleResponse> => {
    const response = await axiosClient.get<ComparativaCombustibleResponse>(`/solicitudes-combustible/${id}/comparativa`);
    return response.data;
  },

  aprobarConDecision: async (id: string, decision_final: 'operativo' | 'jefe', comentario: string, monto_aprobado?: number) => {
    const payload: any = {
      decision_final,
      comentario
    };
    if (decision_final === 'jefe' && monto_aprobado !== undefined) {
      payload.monto_aprobado = monto_aprobado;
    }

    const response = await axiosClient.post(`/solicitudes-combustible/${id}/aprobar-con-decision`, payload);
    return response.data;
  },

  desbloquear: async (id: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${id}/desbloquear`);
    return response.data;
  },

  rechazar: async (id: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${id}/rechazar`, { comentario });
    return response.data;
  }
};
