import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { useNotifications } from '@/shared/notifications';
import { NotificationProvider } from '../NotificationProvider';
import { useAuth } from '@/features/Auth/context/AuthContext';
import { dashboardApi, RecentRequest } from '@/features/Aprobacion/api/dashboardApi';
import { getCacheKeys } from '@/shared/notifications/cache';

vi.mock('@/features/Auth/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/features/Aprobacion/api/dashboardApi', () => ({
  dashboardApi: {
    getRecentRequests: vi.fn(),
  },
}));

const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );
};

const pre_aprobada = (code: string, extra?: Partial<RecentRequest>): RecentRequest => ({
  id: Math.random(),
  code,
  date: '2026-01-01',
  status: 'pre_aprobada',
  type: 'Transporte',
  ...extra,
});

describe('NotificationProvider', () => {
  const mockUseAuth = vi.mocked(useAuth);
  const mockGetRecentRequests = vi.mocked(dashboardApi.getRecentRequests);

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();

    mockUseAuth.mockReturnValue({
      user: { id: 1, name: 'Test User', email: 'test@test.com', roles: ['admin'] },
      logout: vi.fn(),
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
    });

    mockGetRecentRequests.mockResolvedValue({ data: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Sesión', () => {
    it('preserva el caché de notificaciones al montar (hidratación)', async () => {
      const keys = getCacheKeys(1);
      const cachedNotifs = [{
        id: 'cached-1',
        title: 'Nueva Solicitud: TR-100',
        description: 'Se requiere aprobación',
        time: 'Hace 5 min',
        read: false,
        action_url: '/aprobaciones/TR-100'
      }];
      localStorage.setItem(keys.notifs, JSON.stringify(cachedNotifs));

      let resolvePoll!: (v: { data: never[] }) => void;
      mockGetRecentRequests.mockImplementationOnce(() =>
        new Promise(r => { resolvePoll = r; })
      );

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      // Antes de que el poll resuelva, las notificaciones vienen del caché
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toContain('TR-100');

      // La clave sigue existiendo
      expect(localStorage.getItem(keys.notifs)).not.toBeNull();

      await act(async () => {
        resolvePoll({ data: [] });
      });
    });

    it('borra caché del usuario anterior al cambio', async () => {
      const keys1 = getCacheKeys(1);
      localStorage.setItem(keys1.notifs, JSON.stringify([{ id: 1, title: 'Test', description: 'Desc', time: 'Ahora', read: false, action_url: '/test' }]));

      const { rerender } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      mockUseAuth.mockReturnValue({
        user: { id: 2, name: 'User 2', email: 'u2@test.com', roles: ['admin'] },
        logout: vi.fn(),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
      });

      await act(async () => {
        rerender();
        await vi.advanceTimersByTimeAsync(1);
      });

      expect(localStorage.getItem(keys1.notifs)).toBeNull();
    });

    it('NO actualiza estado si el usuario cambia antes de la respuesta', async () => {
      let resolveFirst!: (value: { data: never[] }) => void;
      mockGetRecentRequests.mockImplementationOnce(() =>
        new Promise(resolve => { resolveFirst = resolve; })
      );

      const { result, rerender } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      mockUseAuth.mockReturnValue({
        user: { id: 2, name: 'User 2', email: 'u2@test.com', roles: ['admin'] },
        logout: vi.fn(),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
      });

      await act(async () => {
        rerender();
        await vi.advanceTimersByTimeAsync(1);
      });

      await act(async () => {
        resolveFirst({ data: [] });
        await vi.advanceTimersByTimeAsync(1);
      });

      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('Polling', () => {
    it('hace polling periódicamente', async () => {
      mockGetRecentRequests.mockResolvedValue({
        data: [pre_aprobada('TR-001')]
      });

      renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      const callsBefore = mockGetRecentRequests.mock.calls.length;
      expect(callsBefore).toBeGreaterThanOrEqual(1);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(60000);
      });

      expect(mockGetRecentRequests.mock.calls.length).toBeGreaterThan(callsBefore);
    });
  });

  describe('user.id = 0', () => {
    it('maneja correctamente user.id = 0', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 0, name: 'Zero User', email: 'zero@test.com', roles: ['admin'] },
        logout: vi.fn(),
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.pendingCount).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('elimina la notificación del estado', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-D1'), pre_aprobada('TR-D2')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.notifications).toHaveLength(2);
      const idToDelete = result.current.notifications[0].id;

      act(() => {
        result.current.deleteNotification(idToDelete);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toContain('TR-D2');
    });

    it('persiste la eliminación vía useEffect', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-P1'), pre_aprobada('TR-P2')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const keys = getCacheKeys(1);
      expect(JSON.parse(localStorage.getItem(keys.notifs)!)).toHaveLength(2);

      const idToDelete = result.current.notifications[0].id;
      act(() => {
        result.current.deleteNotification(idToDelete);
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const stored = JSON.parse(localStorage.getItem(keys.notifs)!);
      expect(stored).toHaveLength(1);
    });

    it('no afecta otras notificaciones', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [
          pre_aprobada('TR-0'), pre_aprobada('TR-1'), pre_aprobada('TR-2'),
          pre_aprobada('TR-3'), pre_aprobada('TR-4'),
        ]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.notifications).toHaveLength(5);
      const idToDelete = result.current.notifications[2].id;

      act(() => {
        result.current.deleteNotification(idToDelete);
      });

      expect(result.current.notifications).toHaveLength(4);
    });
  });

  describe('markAllAsRead', () => {
    it('marca todas como leídas', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-M1'), pre_aprobada('TR-M2')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.pendingCount).toBe(2);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.pendingCount).toBe(0);
      expect(result.current.notifications.every(n => n.read)).toBe(true);
    });

    it('pendingCount se actualiza a 0', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-MC1')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.pendingCount).toBe(1);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.pendingCount).toBe(0);
    });
  });

  describe('clearNotifications', () => {
    it('limpia todas las notificaciones del estado', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-C1'), pre_aprobada('TR-C2')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.pendingCount).toBe(0);
    });

    it('la clave se elimina de localStorage', async () => {
      mockGetRecentRequests.mockResolvedValueOnce({
        data: [pre_aprobada('TR-CL1')]
      });

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      act(() => {
        result.current.clearNotifications();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      const keys = getCacheKeys(1);
      expect(localStorage.getItem(keys.notifs)).toBeNull();
    });
  });
});
