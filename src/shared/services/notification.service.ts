import { api } from '../lib/api';

export interface NotificationItem {
  id: string | number;
  tipo?: 'viaje_asignado' | 'viaje_observado' | 'viaje_reasignado' | 'solicitud_rechazada' | 'solicitud_cancelada' | 'destino_agregado' | string;
  titulo: string;
  mensaje: string;
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number;
  read_at?: string | null;
  created_at?: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  links?: Record<string, any>;
  meta?: Record<string, any>;
}

/**
 * Obtener lista paginada de notificaciones del motorista autenticado.
 */
export async function getNotificaciones(page = 1, perPage = 20): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/api/motoristas/me/notificaciones', {
    params: { page, per_page: perPage },
  });
  return data;
}

/**
 * Marcar una notificación específica como leída.
 */
export async function marcarNotificacionLeida(id: string | number): Promise<void> {
  await api.put(`/api/motoristas/me/notificaciones/${id}/leer`);
}

/**
 * Marcar todas las notificaciones como leídas.
 */
export async function marcarTodasNotificacionesLeidas(): Promise<void> {
  await api.put('/api/motoristas/me/notificaciones/marcar-todas');
}
