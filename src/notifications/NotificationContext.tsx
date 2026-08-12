import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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

function loadHistory(): Notification[] {
  const value = loadJson<unknown[]>(NOTIFICATION_HISTORY_KEY, []);
  return Array.isArray(value)
    ? value.filter((item): item is Notification => typeof item === "object" && item !== null && typeof (item as Notification).id === "string").slice(0, MAX_VISIBLE_NOTIFICATIONS)
    : [];
}

function loadDismissedIds(): string[] {
  const value = loadJson<unknown[]>(DISMISSED_NOTIFICATIONS_KEY, []);
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
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
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
  refreshNotifications: async () => undefined,
  markAsRead: async () => undefined,
  markAllRead: async () => undefined,
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
  const [notifications, setNotifications] = useState<Notification[]>(loadHistory);
  const [dismissedIds, setDismissedIds] = useState<string[]>(loadDismissedIds);
  const [toast, setToast] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default",
  );

  const notificationsRef = useRef(notifications);
  const dismissedIdsRef = useRef(dismissedIds);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    notificationsRef.current = notifications;
    saveJson(NOTIFICATION_HISTORY_KEY, notifications.slice(0, MAX_VISIBLE_NOTIFICATIONS));
  }, [notifications]);

  useEffect(() => {
    dismissedIdsRef.current = dismissedIds;
    saveJson(DISMISSED_NOTIFICATIONS_KEY, dismissedIds.slice(-MAX_DISMISSED_NOTIFICATIONS));
  }, [dismissedIds]);

  useEffect(() => {
    if (permission === "granted") void subscribeUserToPush();
  }, [permission]);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const received = await fetchNotifications();
      const dismissed = new Set(dismissedIdsRef.current);
      const visible = received.filter((notification) => !dismissed.has(notification.id));
      const previousIds = new Set(notificationsRef.current.map((notification) => notification.id));
      const newest = visible.find((notification) => !previousIds.has(notification.id));
      notificationsRef.current = visible.slice(0, MAX_VISIBLE_NOTIFICATIONS);
      setNotifications(notificationsRef.current);
      if (hasSyncedRef.current && newest) setToast(newest);
      hasSyncedRef.current = true;
    } catch (requestError) {
      setError(errorMessage(requestError));
      reportError(requestError, { feature: "notifications-api" });
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useNotificationPolling({ poll: refreshNotifications, intervalMs: POLL_MS });

  const markAsRead = useCallback(async (id: string) => {
    const previous = notificationsRef.current;
    const target = previous.find((notification) => notification.id === id);
    if (!target || target.leida) return;
    const optimistic = previous.map((notification) => notification.id === id ? { ...notification, leida: true } : notification);
    notificationsRef.current = optimistic;
    setNotifications(optimistic);
    try {
      await markNotificationAsRead(id);
    } catch (requestError) {
      notificationsRef.current = previous;
      setNotifications(previous);
      reportError(requestError, { feature: "notification-read", notificationId: id });
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const previous = notificationsRef.current;
    if (!previous.some((notification) => !notification.leida)) return;
    const optimistic = previous.map((notification) => ({ ...notification, leida: true }));
    notificationsRef.current = optimistic;
    setNotifications(optimistic);
    try {
      await markAllNotificationsAsRead();
    } catch (requestError) {
      notificationsRef.current = previous;
      setNotifications(previous);
      reportError(requestError, { feature: "notifications-read-all" });
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    if (!notificationsRef.current.some((notification) => notification.id === id)) return;
    const nextDismissed = Array.from(new Set([...dismissedIdsRef.current, id])).slice(-MAX_DISMISSED_NOTIFICATIONS);
    const nextNotifications = notificationsRef.current.filter((notification) => notification.id !== id);
    dismissedIdsRef.current = nextDismissed;
    notificationsRef.current = nextNotifications;
    setDismissedIds(nextDismissed);
    setNotifications(nextNotifications);
  }, []);

  const dismissAllNotifications = useCallback(() => {
    const current = notificationsRef.current;
    if (!current.length) return;
    const nextDismissed = Array.from(new Set([...dismissedIdsRef.current, ...current.map((notification) => notification.id)])).slice(-MAX_DISMISSED_NOTIFICATIONS);
    dismissedIdsRef.current = nextDismissed;
    notificationsRef.current = [];
    setDismissedIds(nextDismissed);
    setNotifications([]);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setPermission(await Notification.requestPermission());
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount: notifications.filter((notification) => !notification.leida).length,
      toast,
      isLoading,
      error,
      refreshNotifications,
      markAsRead,
      markAllRead,
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
