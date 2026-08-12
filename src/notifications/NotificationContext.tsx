import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "../auth/AuthContext";
import { reportError } from "../lib/observability";
import { subscribeUserToPush } from "../services/push.service";
import { useNotificationPolling } from "./useNotificationPolling";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "./notifications.service";

export type { Notification, NotiModulo, NotiTipo } from "./notifications.service";

const NOTIFICATION_HISTORY_KEY = "app_notifications_v2";
const DISMISSED_NOTIFICATIONS_KEY = "app_dismissed_notifications_v1";
const MAX_VISIBLE_NOTIFICATIONS = 20;
const MAX_DISMISSED_NOTIFICATIONS = 200;
const POLL_MS = 180_000;

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage is optional; the API-backed state remains usable when unavailable.
  }
}

function userStorageKey(baseKey: string, userId: string | number | null): string | null {
  return userId === null ? null : `${baseKey}_${String(userId)}`;
}

function loadHistory(userId: string | number | null): Notification[] {
  const key = userStorageKey(NOTIFICATION_HISTORY_KEY, userId);
  if (!key) return [];
  const value = loadJson<unknown[]>(key, []);
  return Array.isArray(value)
    ? value.filter((item): item is Notification => typeof item === "object" && item !== null && typeof (item as Notification).id === "string").slice(0, MAX_VISIBLE_NOTIFICATIONS)
    : [];
}

function loadDismissedIds(userId: string | number | null): string[] {
  const key = userStorageKey(DISMISSED_NOTIFICATIONS_KEY, userId);
  if (!key) return [];
  const value = loadJson<unknown[]>(key, []);
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(-MAX_DISMISSED_NOTIFICATIONS) : [];
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No fue posible actualizar las notificaciones.";
}

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  toast: Notification | null;
  isLoading: boolean;
  error: string | null;
  notificationActionError: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
  retryNotificationAction: () => Promise<boolean>;
  clearNotificationActionError: () => void;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  clearToast: () => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  toast: null,
  isLoading: false,
  error: null,
  notificationActionError: null,
  refreshNotifications: async () => undefined,
  markAsRead: async () => true,
  markAllRead: async () => true,
  retryNotificationAction: async () => false,
  clearNotificationActionError: () => undefined,
  dismissNotification: () => undefined,
  dismissAllNotifications: () => undefined,
  clearToast: () => undefined,
  permission: "default",
  requestPermission: async () => undefined,
});

export function useNotifications(): NotificationContextValue {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const userKey = userId === null ? null : String(userId);
  const [notifications, setNotifications] = useState<Notification[]>(() => loadHistory(userId));
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => loadDismissedIds(userId));
  const [toast, setToast] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationActionError, setNotificationActionError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );

  const notificationsRef = useRef(notifications);
  const dismissedIdsRef = useRef(dismissedIds);
  const hasSyncedRef = useRef(false);
  const previousUserKeyRef = useRef(userKey);
  const stateUserKeyRef = useRef(userKey);
  const skipUserPersistenceRef = useRef(0);
  const lastActionRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (previousUserKeyRef.current === userKey) return;
    previousUserKeyRef.current = userKey;
    stateUserKeyRef.current = userKey;
    skipUserPersistenceRef.current = 2;
    const nextNotifications = loadHistory(userId);
    const nextDismissedIds = loadDismissedIds(userId);
    notificationsRef.current = nextNotifications;
    dismissedIdsRef.current = nextDismissedIds;
    setNotifications(nextNotifications);
    setDismissedIds(nextDismissedIds);
    setToast(null);
    setError(null);
    setNotificationActionError(null);
    lastActionRef.current = null;
    hasSyncedRef.current = false;
  }, [userId, userKey]);

  useEffect(() => {
    if (skipUserPersistenceRef.current > 0) {
      skipUserPersistenceRef.current -= 1;
      return;
    }
    if (stateUserKeyRef.current !== userKey) return;
    notificationsRef.current = notifications;
    const key = userStorageKey(NOTIFICATION_HISTORY_KEY, userId);
    if (key) saveJson(key, notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS));
  }, [notifications, userId, userKey]);

  useEffect(() => {
    if (skipUserPersistenceRef.current > 0) {
      skipUserPersistenceRef.current -= 1;
      return;
    }
    if (stateUserKeyRef.current !== userKey) return;
    dismissedIdsRef.current = dismissedIds;
    const key = userStorageKey(DISMISSED_NOTIFICATIONS_KEY, userId);
    if (key) saveJson(key, dismissedIds.slice(-MAX_DISMISSED_NOTIFICATIONS));
  }, [dismissedIds, userId, userKey]);

  useEffect(() => {
    if (permission === "granted" && userId !== null) void subscribeUserToPush();
  }, [permission, userId]);

  const refreshNotifications = useCallback(async () => {
    if (userKey === null) return;
    const requestUserKey = userKey;
    setIsLoading(true);
    setError(null);
    try {
      const received = await fetchNotifications();
      if (requestUserKey !== userKey) return;
      const dismissed = new Set(dismissedIdsRef.current);
      const visible = received.filter((notification) => !dismissed.has(notification.id));
      const previousIds = new Set(notificationsRef.current.map((notification) => notification.id));
      const newest = visible.find((notification) => !previousIds.has(notification.id));
      const nextNotifications = visible.slice(0, MAX_VISIBLE_NOTIFICATIONS);
      notificationsRef.current = nextNotifications;
      setNotifications(nextNotifications);
      if (hasSyncedRef.current && newest) setToast(newest);
      hasSyncedRef.current = true;
    } catch (requestError) {
      if (requestUserKey !== userKey) return;
      setError(errorMessage(requestError));
      reportError(requestError, { feature: "notifications-api" });
      throw requestError;
    } finally {
      if (requestUserKey === userKey) setIsLoading(false);
    }
  }, [userKey]);

  useNotificationPolling({ poll: refreshNotifications, intervalMs: POLL_MS });

  const clearNotificationActionError = useCallback(() => {
    setNotificationActionError(null);
    lastActionRef.current = null;
  }, []);

  const markAsRead = useCallback(async (id: string): Promise<boolean> => {
    setNotificationActionError(null);
    lastActionRef.current = null;
    const previous = notificationsRef.current;
    const target = previous.find((notification) => notification.id === id);
    if (!target || target.leida) return true;
    const optimistic = previous.map((notification) => notification.id === id ? { ...notification, leida: true } : notification);
    notificationsRef.current = optimistic;
    setNotifications(optimistic);
    try {
      await markNotificationAsRead(id);
      return true;
    } catch (requestError) {
      notificationsRef.current = previous;
      setNotifications(previous);
      setNotificationActionError("No se pudo marcar la notificación como leída. Intenta nuevamente.");
      lastActionRef.current = () => markAsRead(id);
      reportError(requestError, { feature: "notification-read", notificationId: id });
      return false;
    }
  }, []);

  const markAllRead = useCallback(async (): Promise<boolean> => {
    setNotificationActionError(null);
    lastActionRef.current = null;
    const previous = notificationsRef.current;
    if (!previous.some((notification) => !notification.leida)) return true;
    const optimistic = previous.map((notification) => ({ ...notification, leida: true }));
    notificationsRef.current = optimistic;
    setNotifications(optimistic);
    try {
      await markAllNotificationsAsRead();
      return true;
    } catch (requestError) {
      notificationsRef.current = previous;
      setNotifications(previous);
      setNotificationActionError("No se pudieron marcar todas las notificaciones como leídas. Intenta nuevamente.");
      lastActionRef.current = () => markAllRead();
      reportError(requestError, { feature: "notifications-read-all" });
      return false;
    }
  }, []);

  const retryNotificationAction = useCallback(async () => {
    const retry = lastActionRef.current;
    if (!retry) return false;
    return retry();
  }, []);

  const dismissNotification = useCallback((id: string) => {
    if (!notificationsRef.current.some((notification) => notification.id === id)) return;
    const nextDismissed = Array.from(new Set([...dismissedIdsRef.current, id])).slice(-MAX_DISMISSED_NOTIFICATIONS);
    const nextNotifications = notificationsRef.current.filter((notification) => notification.id !== id);
    dismissedIdsRef.current = nextDismissed;
    notificationsRef.current = nextNotifications;
    setDismissedIds(nextDismissed);
    setNotifications(nextNotifications);
    setToast((current) => current?.id === id ? null : current);
  }, []);

  const dismissAllNotifications = useCallback(() => {
    const current = notificationsRef.current;
    if (!current.length) return;
    const nextDismissed = Array.from(new Set([...dismissedIdsRef.current, ...current.map((notification) => notification.id)])).slice(-MAX_DISMISSED_NOTIFICATIONS);
    dismissedIdsRef.current = nextDismissed;
    notificationsRef.current = [];
    setDismissedIds(nextDismissed);
    setNotifications([]);
    setToast(null);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(await Notification.requestPermission());
  }, []);

  const visibleNotifications = stateUserKeyRef.current === userKey ? notifications : [];
  const visibleToast = stateUserKeyRef.current === userKey ? toast : null;

  return (
    <NotificationContext.Provider value={{
      notifications: visibleNotifications,
      unreadCount: visibleNotifications.filter((notification) => !notification.leida).length,
      toast: visibleToast,
      isLoading,
      error,
      notificationActionError,
      refreshNotifications,
      markAsRead,
      markAllRead,
      retryNotificationAction,
      clearNotificationActionError,
      dismissNotification,
      dismissAllNotifications,
      clearToast,
      permission,
      requestPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
