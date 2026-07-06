import { axiosClient } from '../../../shared/api/axiosClient';
import { SolicitudMantenimientoDetalle } from '../types';

export const solicitudMantenimientoApi = {
  getById: async (id: string): Promise<SolicitudMantenimientoDetalle> => {
    const { data } = await axiosClient.get(`/solicitudes-mantenimiento/${id}`);
    return data;
  },

  aprobar: async (id: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${id}/aprobar`, {
      observaciones
    });
    return data;
  },

  rechazar: async (id: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${id}/rechazar`, {
      observaciones
    });
    return data;
  },

  observacion: async (id: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${id}/observacion`, {
      observaciones
    });
    return data;
  }
};
