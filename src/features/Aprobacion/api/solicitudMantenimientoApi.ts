import { axiosClient } from '../../../shared/api/axiosClient';
import { SolicitudMantenimientoDetalle } from '../types';

export const solicitudMantenimientoApi = {
  getById: async (codigo: string): Promise<SolicitudMantenimientoDetalle> => {
    const { data } = await axiosClient.get(`/solicitudes-mantenimiento/${codigo}`);
    return data;
  },

  aprobar: async (codigo: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${codigo}/aprobar`, {
      observaciones
    });
    return data;
  },

  rechazar: async (codigo: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${codigo}/rechazar`, {
      observaciones
    });
    return data;
  },

  observacion: async (codigo: string, observaciones: string) => {
    const { data } = await axiosClient.post(`/solicitudes-mantenimiento/${codigo}/observacion`, {
      observaciones
    });
    return data;
  }
};
