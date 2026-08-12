import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { disconnectEcho, getEcho } from '../lib/echo';
import {
  getNotificaciones,
  marcarNotificacionLeida,
  marcarTodasNotificacionesLeidas,
} from '../services/notification.service';
import type { NotificationPayload } from '../services/notification.service';
import { subscribeUserToPush } from '../services/push.service';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: Date;
  read: boolean;
  tipo?: string;
  modulo?: string;
  url?: string;
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number | string | null;
}

interface NotificationContextProps {
  permission: NotificationPermission | 'default';
  requestPermission: () => Promise<void>;
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  notificationError: string | null;
  clearNotifications: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextProps>({
  permission: 'default',
  requestPermission: async () => {},
  notifications: [],
  refreshNotifications: async () => {},
  isLoading: false,
  notificationError: null,
  clearNotifications: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  unreadCount: 0,
});

export const useNotification = () => useContext(NotificationContext);

const playChime = () => {
  try {
    const AudioContextConstructor: typeof AudioContext | undefined = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const ctx = new AudioContextConstructor();
    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    playNote(987.77, ctx.currentTime, 0.4);
    playNote(1318.51, ctx.currentTime + 0.15, 0.6);
  } catch (error) {
    console.warn('Audio feedback failed or was blocked by the browser', error);
  }
};

type NotificationInput = {
  id?: string | number;
  data?: NotificationPayload;
  title?: string;
  body?: string;
  titulo?: string;
  mensaje?: string;
  date?: Date;
  created_at?: string;
  read?: boolean;
  read_at?: string | null;
  tipo?: string;
  modulo?: string;
  url?: string;
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number | string | null;
};

const parseNotificationDate = (value?: Date | string): Date => {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const normalizeNotification = (input: NotificationInput): AppNotification => {
  const payload = input.data ?? input;
  const localKey = [
    'local',
    payload.tipo ?? input.tipo ?? payload.titulo ?? input.titulo ?? 'notification',
    payload.solicitud_id ?? input.solicitud_id ?? input.created_at ?? 'event',
  ].join('-');

  return {
    id: String(input.id ?? localKey),
    title: payload.titulo || input.title || 'Nueva notificación',
    body: payload.mensaje || input.body || '',
    date: parseNotificationDate(input.date ?? input.created_at),
    read: typeof input.read === 'boolean' ? input.read : Boolean(input.read_at),
    tipo: payload.tipo || input.tipo,
    modulo: payload.modulo || input.modulo,
    url: payload.url || input.url,
    solicitud_id: payload.solicitud_id ?? input.solicitud_id,
    solicitud_codigo: payload.solicitud_codigo ?? input.solicitud_codigo,
    ticket: payload.ticket ?? input.ticket,
  };
};

export function resolveNotificationUrl(notification: Pick<AppNotification, 'url' | 'solicitud_id'>): string {
  const backendUrl = notification.url?.trim();

  if (backendUrl && backendUrl !== '/viajes') {
    return backendUrl;
  }

  if (notification.solicitud_id !== undefined && notification.solicitud_id !== null) {
    return '/viajes/' + notification.solicitud_id + '/activo';
  }

  return '/dashboard';
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const knownIdsRef = useRef<Set<string>>(new Set());
  const notificationsRef = useRef<AppNotification[]>([]);

  const replaceNotifications = useCallback((next: AppNotification[]) => {
    notificationsRef.current = next.slice(0, 20)
    setNotifications(notificationsRef.current);
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const clearNotifications = useCallback(() => {
    knownIdsRef.current.clear();
    replaceNotifications([]);
  }, [replaceNotifications]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    const previous = notificationsRef.current;
    const next = previous.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );

    notificationsRef.current = next.slice(0, 20)
    setNotifications(notificationsRef.current);

    try {
      await marcarNotificacionLeida(id);
    } catch (error) {
      notificationsRef.current = previous;
      setNotifications(previous);
      toast.error('No se pudo marcar la notificación como leída.');
      console.warn('No se pudo marcar la notificación como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    const previous = notificationsRef.current;
    const next = previous.map((notification) => ({ ...notification, read: true }));

    notificationsRef.current = next.slice(0, 20)
    setNotifications(notificationsRef.current);

    try {
      await marcarTodasNotificacionesLeidas();
    } catch (error) {
      notificationsRef.current = previous;
      setNotifications(previous);
      toast.error('No se pudieron marcar todas las notificaciones como leídas.');
      console.warn('No se pudieron marcar todas las notificaciones como leídas:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      toast.error('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }

    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission === 'granted') {
        toast.success('¡Notificaciones activadas con éxito!');
        await subscribeUserToPush('granted');
      } else {
        toast.warning('Notificaciones bloqueadas o denegadas.');
      }
    } catch (error) {
      console.error('Error al pedir permisos de notificación:', error);
    }
  }, []);

  const handleIncomingNotification = useCallback((event: NotificationInput) => {
    const newNotification = normalizeNotification({ ...event, read: false });

    if (knownIdsRef.current.has(newNotification.id)) {
      const updated = notificationsRef.current.map((item) =>
        item.id === newNotification.id ? { ...item, ...newNotification } : item,
      );
      replaceNotifications(updated);
      return;
    }

    knownIdsRef.current.add(newNotification.id);
    replaceNotifications([newNotification, ...notificationsRef.current].slice(0, 20));
    playChime();

    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    toast(newNotification.title, {
      description: newNotification.body,
      duration: 10000,
      action: {
        label: 'Ver detalle',
        onClick: () => {
          void markAsRead(newNotification.id);
          navigate(resolveNotificationUrl(newNotification));
        },
      },
    });

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]).then((registration) => {
          if (registration) {
            registration.showNotification(newNotification.title, {
              body: newNotification.body,
              icon: '/icon-192x192.png',
              vibrate: [200, 100, 200],
              data: { url: resolveNotificationUrl(newNotification) },
            } as NotificationOptions);
          }
        }).catch(() => {});
      }
    }
  }, [markAsRead, navigate, replaceNotifications]);

  const fetchLatestNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setIsLoading(true);
    }

    try {
      const response = await getNotificaciones(1, 20);
      const rawItems = Array.isArray(response?.data) ? response.data : [];
      const list = rawItems.map(normalizeNotification);

      if (isPolling) {
        list.forEach((item) => {
          if (!knownIdsRef.current.has(item.id) && !item.read) {
            handleIncomingNotification(item);
          }
        });
      }

      list.forEach((item) => knownIdsRef.current.add(item.id));
      replaceNotifications(list);
      setNotificationError(null);
    } catch (error) {
      if (!isPolling) {
        setNotificationError('No se pudieron cargar las notificaciones. Intenta nuevamente.');
        console.warn('No se pudo cargar el historial de notificaciones:', error);
      }
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [handleIncomingNotification, replaceNotifications]);

  const refreshNotifications = useCallback(
    () => fetchLatestNotifications(false),
    [fetchLatestNotifications],
  );

  useEffect(() => {
    if (!user) return;

    knownIdsRef.current.clear();
    notificationsRef.current = [];
    setNotificationError(null);
    void fetchLatestNotifications(false);

    const pollInterval = window.setInterval(() => {
      void fetchLatestNotifications(true);
    }, 15000);

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      void subscribeUserToPush('granted');
    }

    const motoristaId = user.motorista_id || user.id;
    if (motoristaId) {
      const channelName = 'motorista.' + motoristaId;

      try {
        const echo = getEcho();
        echo?.private(channelName).listen('.notification.received', handleIncomingNotification);
      } catch (error) {
        console.warn('Echo desacoplado o no disponible:', error);
      }
    }

    return () => {
      window.clearInterval(pollInterval);

      if (motoristaId) {
        try {
          const echo = getEcho();
          echo?.leave('motorista.' + motoristaId);
          disconnectEcho();
        } catch {
          // Echo es opcional; la API continúa siendo la fuente principal.
        }
      }
    };
  }, [fetchLatestNotifications, handleIncomingNotification, user]);

  return (
    <NotificationContext.Provider value={{
      permission,
      requestPermission,
      notifications,
      refreshNotifications,
      isLoading,
      notificationError,
      clearNotifications,
      markAsRead,
      markAllAsRead,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
