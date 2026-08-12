import { axiosClient } from '@/shared/api/axiosClient';
import { NotificationItem } from './types';
import { formatNotificationDate, resolveNotificationPath } from './notification-routing';

export interface BackendNotificationData {
  titulo?: unknown;
  mensaje?: unknown;
  tipo?: unknown;
  modulo?: unknown;
  solicitud_id?: unknown;
  solicitud_codigo?: unknown;
  ticket?: unknown;
  url?: unknown;
}

export interface BackendNotification {
  id: string | number;
  type?: unknown;
  data?: BackendNotificationData | null;
  read_at?: string | null;
  created_at?: string | null;
}

interface LaravelPaginator<T> {
  data?: T[];
}

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const asId = (value: unknown): string | number | undefined =>
  typeof value === 'string' || typeof value === 'number' ? value : undefined;

const extractItems = (payload: unknown): BackendNotification[] => {
  if (Array.isArray(payload)) return payload as BackendNotification[];

  if (payload && typeof payload === 'object') {
    const paginator = payload as LaravelPaginator<BackendNotification>;
    return Array.isArray(paginator.data) ? paginator.data : [];
  }

  return [];
};

export const normalizeNotification = (item: BackendNotification): NotificationItem | null => {
  const id = asString(item.id);
  if (!id) return null;

  const data = item.data && typeof item.data === 'object' ? item.data : {};
  const title = asString(data.titulo) ?? 'Nueva notificación';
  const description = asString(data.mensaje) ?? 'Tienes una actualización pendiente.';
  const type = asString(data.tipo) ?? asString(item.type) ?? 'notificacion';
  const module = asString(data.modulo);
  const requestId = asId(data.solicitud_id);
  const requestCode = asString(data.solicitud_codigo);
  const actionUrl = resolveNotificationPath({
    url: asString(data.url),
    module,
    requestCode
  });
  const createdAt = asString(item.created_at);

  return {
    id,
    title,
    description,
    time: formatNotificationDate(createdAt),
    read: Boolean(item.read_at),
    action_url: actionUrl,
    type,
    module,
    requestId,
    requestCode,
    ticket: data.ticket === null ? null : asString(data.ticket) ?? null,
    createdAt
  };
};

export async function fetchNotifications(
  page = 1,
  perPage = 20,
  signal?: AbortSignal
): Promise<NotificationItem[]> {
  const response = await axiosClient.get<BackendNotification[] | LaravelPaginator<BackendNotification>>(
    '/me/notificaciones',
    { params: { page, per_page: Math.min(Math.max(perPage, 1), 20) }, signal }
  );

  return extractItems(response.data)
    .map(normalizeNotification)
    .filter((item): item is NotificationItem => item !== null);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await axiosClient.put('/me/notificaciones/' + encodeURIComponent(id) + '/leer');
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await axiosClient.put('/me/notificaciones/marcar-todas');
}
