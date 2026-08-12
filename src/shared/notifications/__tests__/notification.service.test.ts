import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '@/shared/api/axiosClient';
import {
  fetchNotifications,
  normalizeNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '../notification.service';

vi.mock('@/shared/api/axiosClient', () => ({
  axiosClient: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

describe('notification.service', () => {
  const get = vi.mocked(axiosClient.get);
  const put = vi.mocked(axiosClient.put);

  beforeEach(() => vi.clearAllMocks());

  it('lee data.titulo y data.mensaje del paginador Laravel', async () => {
    get.mockResolvedValue({
      data: {
        data: [{
          id: 'uuid-1',
          type: 'database',
          data: {
            titulo: 'Solicitud pendiente',
            mensaje: 'Debes revisar TR-10',
            tipo: 'solicitud_pendiente_aprobacion',
            modulo: 'transporte',
            solicitud_codigo: 'TR-10',
            url: '/aprobaciones/TR-10',
            ticket: null
          },
          read_at: null,
          created_at: '2026-08-12T12:00:00Z'
        }]
      }
    });

    const result = await fetchNotifications();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'uuid-1',
      title: 'Solicitud pendiente',
      description: 'Debes revisar TR-10',
      type: 'solicitud_pendiente_aprobacion',
      action_url: '/aprobaciones/TR-10',
      read: false,
      ticket: null
    });
    expect(get).toHaveBeenCalledWith('/me/notificaciones', expect.objectContaining({
      params: { page: 1, per_page: 20 }
    }));
  });

  it('normaliza una notificación leída con URL por módulo', () => {
    const result = normalizeNotification({
      id: 77,
      data: {
        titulo: 'Mantenimiento',
        mensaje: 'Revisión requerida',
        tipo: 'solicitud_pendiente_aprobacion',
        modulo: 'mantenimiento',
        solicitud_codigo: 'MT-77'
      },
      read_at: '2026-08-12T12:00:00Z',
      created_at: '2026-08-12T12:00:00Z'
    });

    expect(result).toMatchObject({
      id: '77',
      action_url: '/mantenimiento/aprobaciones/MT-77',
      read: true
    });
  });

  it('usa la ruta estática para marcar todas', async () => {
    put.mockResolvedValue({ data: {} });

    await markNotificationAsRead('uuid/1');
    await markAllNotificationsAsRead();

    expect(put).toHaveBeenNthCalledWith(1, '/me/notificaciones/uuid%2F1/leer');
    expect(put).toHaveBeenNthCalledWith(2, '/me/notificaciones/marcar-todas');
  });
});
