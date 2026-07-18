import { axiosClient } from '../../../shared/api/axiosClient';
import { ComparativaCombustibleResponse } from '../types';

export const solicitudCombustibleApi = {
  getComparativa: async (codigo: string): Promise<ComparativaCombustibleResponse> => {
    const response = await axiosClient.get<ComparativaCombustibleResponse>(`/solicitudes-combustible/${codigo}/comparativa`);
    return response.data;
  },

  aprobar: async (codigo: string, comentario?: string) => {
    const payload: Record<string, string> = {};
    if (comentario) payload.observaciones = comentario;
    else payload.observaciones = 'Aprobado por jefatura'; // Fallback por si acaso, aunque el backend lo requiere
    const response = await axiosClient.post(`/solicitudes-combustible/${codigo}/aprobar`, payload);
    return response.data;
  },

  observacion: async (codigo: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${codigo}/observacion`, { observaciones: comentario });
    return response.data;
  },

  preAprobar: async (codigo: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${codigo}/pre-aprobar`, { observaciones: comentario });
    return response.data;
  },

  aprobarConDecision: async (codigo: string, decision_final: 'operativo' | 'jefe', comentario: string, monto_aprobado?: number) => {
    const payload: Record<string, unknown> = {
      decision_final,
      comentario
    };
    if (decision_final === 'jefe' && monto_aprobado !== undefined) {
      payload.monto_aprobado = monto_aprobado;
    }

    const response = await axiosClient.post(`/solicitudes-combustible/${codigo}/aprobar-con-decision`, payload);
    return response.data;
  },



  rechazar: async (codigo: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-combustible/${codigo}/rechazar`, { motivo: comentario });
    return response.data;
  }
};
