import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import axios from 'axios';
import { useAuth } from '@/features/Auth/context/useAuth';
import { hasJefaturaAccess } from '@/shared/auth/roles';
import {
  clearLegacyCache,
  getCacheKeys,
  isValidNotification
} from '@/shared/notifications/cache';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead
} from '@/shared/notifications/notification.service';
import {
  NotificationContext,
  NotificationItem
} from '@/shared/notifications/types';
import {
  enableUserPush,
  disableUserPush
} from '@/shared/services/push.service';

const POLL_MS = 60000;
const MAX_NOTIFICATIONS = 20;
const MAX_DISMISSED = 200;

type FailedAction =
  | { kind: 'read'; id: string }
  | { kind: 'all' };

const loadCachedNotifications = (key: string): NotificationItem[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(isValidNotification).slice(0, MAX_NOTIFICATIONS)
      : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

const loadDismissedIds = (key: string): Set<string> => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((value): value is string => typeof value === 'string').slice(-MAX_DISMISSED)
    );
  } catch {
    localStorage.removeItem(key);
    return new Set();
  }
};

const mergeNotifications = (
  remote: NotificationItem[],
  previous: NotificationItem[],
  dismissed: Set<string>
): NotificationItem[] => {
  const previousById = new Map(previous.map(item => [item.id, item]));
  const seen = new Set<string>();

  return remote
    .filter(item => !dismissed.has(item.id))
    .map(item => {
      const previousItem = previousById.get(item.id);
      return previousItem?.read && !item.read ? { ...item, read: true } : item;
    })
    .filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, MAX_NOTIFICATIONS);
};

const persistDismissed = (key: string, dismissed: Set<string>) => {
  localStorage.setItem(key, JSON.stringify(Array.from(dismissed).slice(-MAX_DISMISSED)));
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const canAccess = useMemo(() => hasJefaturaAccess(user?.roles), [user?.roles]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hydratedUserId, setHydratedUserId] = useState<number | string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationActionError, setNotificationActionError] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);

  const activeUserIdRef = useRef<number | string | null>(null);
  const dismissedIdsRef = useRef<Set<string>>(new Set());
  const requestControllerRef = useRef<AbortController | null>(null);
  const failedActionRef = useRef<FailedAction | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (userId === null || !canAccess) return;

    const controller = new AbortController();
    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;
    setIsLoading(true);
    setError(null);

    try {
      const remote = await fetchNotifications(1, MAX_NOTIFICATIONS, controller.signal);
      if (controller.signal.aborted || activeUserIdRef.current !== userId) return;

      setNotifications(previous =>
        mergeNotifications(remote, previous, dismissedIdsRef.current)
      );
    } catch (requestError) {
      if (!controller.signal.aborted && activeUserIdRef.current === userId && !axios.isCancel(requestError)) {
        console.error('[NotificationProvider] Error al consultar notificaciones:', requestError);
        setError('No se pudieron cargar las notificaciones. Puedes reintentar.');
      }
    } finally {
      if (!controller.signal.aborted && activeUserIdRef.current === userId) {
        setIsLoading(false);
      }
    }
  }, [canAccess, userId]);

  useEffect(() => {
    clearLegacyCache();
  }, []);

  useEffect(() => {
    activeUserIdRef.current = userId;
    requestControllerRef.current?.abort();

    // Este reset evita que se vea el historial del usuario anterior durante la hidratación.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotifications([]);
    setHydratedUserId(null);
    setError(null);
    setNotificationActionError(null);
    setPushEnabled(false);
    failedActionRef.current = null;

    if (userId === null || !canAccess) return;

    const keys = getCacheKeys(userId);
    dismissedIdsRef.current = loadDismissedIds(keys.dismissed);
    setNotifications(loadCachedNotifications(keys.notifs));
    setHydratedUserId(userId);

    void refreshNotifications();
    const intervalId = window.setInterval(() => {
      void refreshNotifications();
    }, POLL_MS);

    return () => {
      window.clearInterval(intervalId);
      requestControllerRef.current?.abort();
    };
  }, [canAccess, refreshNotifications, userId]);

  useEffect(() => {
    if (userId === null || hydratedUserId !== userId) return;

    const key = getCacheKeys(userId).notifs;
    if (notifications.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(notifications));
    }
  }, [hydratedUserId, notifications, userId]);

  const pendingCount = useMemo(
    () => notifications.filter(item => !item.read).length,
    [notifications]
  );

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    const previous = notifications.find(item => item.id === id);
    if (!previous || previous.read) return true;

    setNotificationActionError(null);
    setNotifications(current =>
      current.map(item => item.id === id ? { ...item, read: true } : item)
    );

    try {
      await markNotificationAsRead(id);
      return true;
    } catch (actionError) {
      setNotifications(current =>
        current.map(item => item.id === id ? previous : item)
      );
      failedActionRef.current = { kind: 'read', id };
      setNotificationActionError('No se pudo marcar la notificación como leída. Reintenta.');
      console.error('[NotificationProvider] Error al marcar notificación:', actionError);
      return false;
    }
  }, [notifications]);

  const markAllRead = useCallback(async (): Promise<boolean> => {
    if (!notifications.some(item => !item.read)) return true;

    const previous = notifications;
    setNotificationActionError(null);
    setNotifications(current => current.map(item => ({ ...item, read: true })));

    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (actionError) {
      setNotifications(previous);
      failedActionRef.current = { kind: 'all' };
      setNotificationActionError('No se pudieron marcar todas las notificaciones. Reintenta.');
      console.error('[NotificationProvider] Error al marcar todas:', actionError);
      return false;
    }
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    dismissedIdsRef.current.add(id);
    const key = userId === null ? null : getCacheKeys(userId).dismissed;
    if (key) persistDismissed(key, dismissedIdsRef.current);
    setNotifications(current => current.filter(item => item.id !== id));
  }, [userId]);

  const dismissAllNotifications = useCallback(() => {
    notifications.forEach(item => dismissedIdsRef.current.add(item.id));
    if (userId !== null) {
      persistDismissed(getCacheKeys(userId).dismissed, dismissedIdsRef.current);
    }
    setNotifications([]);
  }, [notifications, userId]);

  const clearNotificationActionError = useCallback(() => {
    setNotificationActionError(null);
    failedActionRef.current = null;
  }, []);

  const retryNotificationAction = useCallback(async (): Promise<boolean> => {
    const failedAction = failedActionRef.current;
    if (!failedAction) return false;
    failedActionRef.current = null;
    setNotificationActionError(null);
    return failedAction.kind === 'read'
      ? markAsRead(failedAction.id)
      : markAllRead();
  }, [markAllRead, markAsRead]);

  const enablePush = useCallback(async (): Promise<boolean> => {
    const enabled = await enableUserPush();
    setPushEnabled(enabled);
    return enabled;
  }, []);

  const disablePush = useCallback(async (): Promise<void> => {
    await disableUserPush();
    setPushEnabled(false);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      pendingCount,
      isLoading,
      error,
      notificationActionError,
      refreshNotifications,
      markAsRead,
      markAllRead,
      dismissNotification,
      dismissAllNotifications,
      clearNotificationActionError,
      retryNotificationAction,
      enablePush,
      disablePush,
      pushEnabled
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
