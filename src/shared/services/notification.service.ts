import { api } from '../lib/api';

export interface NotificationPayload {
  tipo?: string;
  titulo?: string;
  mensaje?: string;
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number | string | null;
  modulo?: string;
  url?: string;
  comentario?: string | null;
  nombre_destino?: string;
}

export interface NotificationItem {
  id: string | number;
  type?: string;
  data: NotificationPayload;
  notifiable_type?: string;
  notifiable_id?: string | number;
  read_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  links?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

export async function getNotificaciones(page = 1, perPage = 20): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/api/motoristas/me/notificaciones', {
    params: { page, per_page: perPage },
  });
  return data;
}

export async function marcarNotificacionLeida(id: string | number): Promise<void> {
  await api.put('/api/motoristas/me/notificaciones/' + id + '/leer');
}

export async function marcarTodasNotificacionesLeidas(): Promise<void> {
  await api.put('/api/motoristas/me/notificaciones/marcar-todas');
}
