import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useNotifications } from '@/shared/notifications';
import { NotificationProvider } from '../NotificationProvider';
import { useAuth } from '@/features/Auth/context/useAuth';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/shared/notifications/notification.service';
import { enableUserPush } from '@/shared/services/push.service';
import { getCacheKeys } from '@/shared/notifications/cache';

vi.mock('@/features/Auth/context/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/shared/notifications/notification.service', () => ({
  fetchNotifications: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn()
}));

vi.mock('@/shared/services/push.service', () => ({
  enableUserPush: vi.fn(),
  disableUserPush: vi.fn()
}));

const createWrapper = () => ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

const makeNotification = (id: string, read = false) => ({
  id,
  title: 'Solicitud ' + id,
  description: 'Revisa la solicitud',
  time: '12 ago 2026, 10:00',
  read,
  action_url: '/aprobaciones/' + id,
  type: 'solicitud_pendiente_aprobacion',
  module: 'transporte',
  requestCode: id
});

describe('NotificationProvider', () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockFetch = vi.mocked(fetchNotifications);
  const mockMark = vi.mocked(markNotificationAsRead);
  const mockMarkAll = vi.mocked(markAllNotificationsAsRead);
  const mockEnablePush = vi.mocked(enableUserPush);

  let authState: ReturnType<typeof useAuth>;

  beforeEach(() => {
    localStorage.clear();
    authState = {
      user: { id: 1, name: 'Jefatura', email: 'jefatura@test.com', roles: ['admin'] },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn()
    };
    mockUseAuth.mockImplementation(() => authState);
    mockFetch.mockResolvedValue([]);
    mockMark.mockResolvedValue(undefined);
    mockMarkAll.mockResolvedValue(undefined);
    mockEnablePush.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('normaliza la respuesta real y deduplica por UUID', async () => {
    mockFetch.mockResolvedValue([makeNotification('uuid-1'), makeNotification('uuid-1'), makeNotification('uuid-2')]);

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.notifications).toHaveLength(2));
    expect(result.current.notifications[0].id).toBe('uuid-1');
    expect(result.current.pendingCount).toBe(2);
  });

  it('separa el historial al cambiar de usuario', async () => {
    const keys = getCacheKeys(1);
    localStorage.setItem(keys.notifs, JSON.stringify([makeNotification('old')]));

    const { result, rerender } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('old'));

    authState = {
      ...authState,
      user: { id: 2, name: 'Otra', email: 'otra@test.com', roles: ['admin'] }
    };
    mockFetch.mockResolvedValue([]);

    await act(async () => {
      rerender();
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.notifications).toEqual([]));
    expect(result.current.notifications.some(item => item.id === 'old')).toBe(false);
  });

  it('restaura una lectura optimista si falla el endpoint', async () => {
    mockFetch.mockResolvedValue([makeNotification('uuid-read')]);
    mockMark.mockRejectedValueOnce(new Error('offline'));

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    let success = true;
    await act(async () => {
      success = await result.current.markAsRead('uuid-read');
    });

    expect(success).toBe(false);
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.notificationActionError).toContain('No se pudo marcar');
  });

  it('restaura todas las notificaciones si falla marcar todas', async () => {
    mockFetch.mockResolvedValue([makeNotification('uuid-all')]);
    mockMarkAll.mockRejectedValueOnce(new Error('offline'));

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    let success = true;
    await act(async () => {
      success = await result.current.markAllRead();
    });

    expect(success).toBe(false);
    expect(result.current.pendingCount).toBe(1);
    expect(result.current.notificationActionError).toContain('No se pudieron marcar');
  });

  it('limpia localmente y conserva los UUID descartados', async () => {
    mockFetch.mockResolvedValue([makeNotification('uuid-dismiss')]);

    const { result } = renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));

    act(() => result.current.dismissNotification('uuid-dismiss'));

    expect(result.current.notifications).toEqual([]);
    expect(localStorage.getItem(getCacheKeys(1).dismissed)).toContain('uuid-dismiss');
  });

  it('no solicita permiso Push automáticamente', async () => {
    renderHook(() => useNotifications(), { wrapper: createWrapper() });
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    expect(mockEnablePush).not.toHaveBeenCalled();
  });
});
