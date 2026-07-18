import { axiosClient } from '../../../shared/api/axiosClient';
import { ComparativaResponse } from '../types';

export interface RecursoDisponible {
  vehiculos: Array<{ id: number; placa: string; marca: string; modelo?: string; tipo?: string; label?: string; nivel_combustible?: { valor: number; label: string } }>;
  motoristas: Array<{ id: number; nombre: string; dui?: string; telefono?: string }>;
}

export const solicitudApi = {
  getComparativa: async (codigo: string): Promise<ComparativaResponse> => {
    const response = await axiosClient.get<ComparativaResponse>(`/solicitudes-transporte/${codigo}/comparativa`);
    return response.data;
  },

  aprobarConDecision: async (codigo: string, decision_final: 'operativo' | 'sistema' | 'manual', comentario: string, vehiculo_id?: number, motorista_id?: number) => {
    interface AprobarPayload {
      decision_final: 'operativo' | 'sistema' | 'manual';
      comentario: string;
      vehiculo_id?: number;
      motorista_id?: number;
    }
    const payload: AprobarPayload = { decision_final, comentario };
    if (vehiculo_id) payload.vehiculo_id = vehiculo_id;
    if (motorista_id) payload.motorista_id = motorista_id;
    const response = await axiosClient.post(`/solicitudes-transporte/${codigo}/aprobar-con-decision`, payload);
    return response.data;
  },

  desbloquear: async (codigo: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${codigo}/desbloquear`);
    return response.data;
  },

  programar: async (codigo: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${codigo}/programar`);
    return response.data;
  },

  rechazar: async (codigo: string, comentario: string) => {
    const response = await axiosClient.post(`/solicitudes-transporte/${codigo}/rechazar`, { comentario });
    return response.data;
  },

  // Nuevo: Reasignar motorista/vehículo de un viaje ya aprobado
  reasignar: async (codigo: string, vehiculo_id: number, motorista_id: number, motivo_reasignacion: string) => {
    const response = await axiosClient.put(`/solicitudes-transporte/${codigo}/reasignar`, {
      vehiculo_id,
      motorista_id,
      motivo_reasignacion
    });
    return response.data;
  },

  // Nuevo: Obtener recursos disponibles para reasignación
  getRecursosDisponibles: async (fecha_salida?: string, fecha_retorno?: string): Promise<RecursoDisponible> => {
    const params: Record<string, string> = {};
    if (fecha_salida) params.fecha_salida = fecha_salida;
    if (fecha_retorno) params.fecha_retorno = fecha_retorno;
    const response = await axiosClient.get<RecursoDisponible>('/recursos/disponibles', { params });
    return response.data;
  },

  // Nuevo: Añadir un destino adicional a una solicitud que ya está en curso (EN_EJECUCION)
  addDestinoEnEjecucion: async (codigo: string, destino_adicional: string, lat?: number, lng?: number) => {
    const payload: Record<string, unknown> = { nombre: destino_adicional };
    if (lat !== undefined && lng !== undefined) {
      payload.lat = lat;
      payload.lng = lng;
    }
    const response = await axiosClient.post(`/solicitudes-transporte/${codigo}/destino-en-ejecucion`, payload);
    return response.data;
  }
};
