import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getEcho, disconnectEcho } from '../lib/echo';
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
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number;
}

interface NotificationContextProps {
  permission: NotificationPermission | 'default';
  requestPermission: () => Promise<void>;
  simulateNotification: (title: string, body: string) => void;
  notifications: AppNotification[];
  refreshNotifications: () => Promise<void>;
  isLoading: boolean;
  notificationError: string | null;
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextProps>({
  permission: 'default',
  requestPermission: async () => {},
  simulateNotification: () => {},
  notifications: [],
  refreshNotifications: async () => {},
  isLoading: false,
  notificationError: null,
  clearNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  unreadCount: 0,
});

export const useNotification = () => useContext(NotificationContext);

// Generador de sonido sintético (ding-ding) sin requerir archivos MP3
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Dos notas rápidas tipo "Ding-Ding"
    playNote(987.77, ctx.currentTime, 0.4);      
    playNote(1318.51, ctx.currentTime + 0.15, 0.6); 
  } catch (e) {
    console.warn('Audio feedback failed or blocked by browser', e);
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
  solicitud_id?: number;
  solicitud_codigo?: string;
  ticket?: number;
};

const parseNotificationDate = (value?: Date | string): Date => {
  const date = value instanceof Date ? value : value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

/**
 * Adapta tanto el registro database de Laravel como los eventos planos
 * usados por las notificaciones locales/realtime al modelo de la interfaz.
 */
const normalizeNotification = (input: NotificationInput): AppNotification => {
  const payload = input.data ?? input;

  return {
    id: String(input.id ?? Math.random().toString(36).substring(2, 9)),
    title: payload.titulo || input.title || 'Nueva Notificacion',
    body: payload.mensaje || input.body || '',
    date: parseNotificationDate(input.date ?? input.created_at),
    read: typeof input.read === 'boolean' ? input.read : Boolean(input.read_at),
    tipo: payload.tipo || input.tipo,
    solicitud_id: payload.solicitud_id ?? input.solicitud_id,
    solicitud_codigo: payload.solicitud_codigo ?? input.solicitud_codigo,
    ticket: payload.ticket ?? input.ticket,
  };
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const knownIdsRef = React.useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter(n => !n.read).length;

  const clearNotifications = () => setNotifications([]);
  
  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await marcarNotificacionLeida(id);
    } catch (e) {
      console.warn('No se pudo marcar la notificación como leída en el backend:', e);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await marcarTodasNotificacionesLeidas();
    } catch (e) {
      console.warn('No se pudo marcar todas las notificaciones como leídas en el backend:', e);
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm === 'granted') {
        toast.success('¡Notificaciones activadas con éxito!');
        // Activar la suscripción Web Push VAPID inmediatamente
        subscribeUserToPush();
      } else {
        toast.warning('Notificaciones bloqueadas o denegadas.');
      }
    } catch (error) {
      console.error('Error al pedir permisos:', error);
    }
  };

  const handleIncomingNotification = useCallback((event: NotificationInput) => {
    const newNotif = normalizeNotification({ ...event, read: false });

    if (knownIdsRef.current.has(newNotif.id)) {
      setNotifications(prev => prev.map(item => item.id === newNotif.id ? { ...item, ...newNotif } : item));
      return;
    }

    knownIdsRef.current.add(newNotif.id);
    setNotifications(prev => [newNotif, ...prev]);
    // 1. Feedback Físico y Sonoro
    playChime();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    // 2. Mostrar in-app (Toast Persistente)
    toast(newNotif.title, {
      description: newNotif.body,
      duration: 10000,
      action: {
        label: 'Ver Detalle 🚗',
        onClick: () => {
          markAsRead(newNotif.id);
          navigate('/dashboard');
        },
      },
    });

    // 3. Notificación de Sistema Operativo (con timeout de seguridad para Service Worker)
    if (Notification.permission === 'granted') {
      if ('serviceWorker' in navigator) {
        Promise.race([
          navigator.serviceWorker.ready,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500))
        ]).then((reg) => {
          if (reg) {
            reg.showNotification(newNotif.title, {
              body: newNotif.body,
              icon: '/icon-192x192.png',
              vibrate: [200, 100, 200],
            } as any);
          } else if (typeof Notification === 'function') {
            try {
              new Notification(newNotif.title, { body: newNotif.body, icon: '/icon-192x192.png' });
            } catch {}
          }
        }).catch(() => {});
      } else if (typeof Notification === 'function') {
        try {
          new Notification(newNotif.title, { body: newNotif.body, icon: '/icon-192x192.png' });
        } catch {}
      }
    }
  }, [markAsRead, navigate]);

  const fetchLatestNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) {
      setIsLoading(true);
    }

    try {
      const res = await getNotificaciones(1, 20);
      const rawItems = Array.isArray(res?.data) ? res.data : [];
      const list: AppNotification[] = rawItems.map(normalizeNotification);

      if (isPolling) {
        // Disparar alertas para notificaciones no leidas verdaderamente nuevas
        list.forEach(item => {
          if (!knownIdsRef.current.has(item.id) && !item.read) {
            handleIncomingNotification(item);
          }
        });
      }

      list.forEach(item => knownIdsRef.current.add(item.id));
      setNotifications(list);
      setNotificationError(null);
    } catch (err) {
      if (!isPolling) {
        setNotificationError('No se pudieron cargar las notificaciones. Intenta nuevamente.');
        console.warn('No se pudo cargar el historial de notificaciones:', err);
      }
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [handleIncomingNotification]);

  const refreshNotifications = useCallback(
    () => fetchLatestNotifications(false),
    [fetchLatestNotifications],
  );

  // Cargar notificaciones REST, Polling recurrente cada 15s y Push VAPID
  useEffect(() => {
    if (!user) return;
    const motoristaId = user?.motorista_id || (user as any)?.id;

    knownIdsRef.current.clear();
    setNotificationError(null);

    // 1. Obtener notificaciones iniciales
    fetchLatestNotifications(false);

    // 2. Polling periódico de notificaciones REST cada 15 segundos
    const pollInterval = setInterval(() => {
      fetchLatestNotifications(true);
    }, 15000);

    // 3. Intentar registrar suscripción Web Push VAPID si los permisos están dados
    if (Notification.permission === 'granted') {
      subscribeUserToPush();
    }

    // 4. Mantener Echo como canal secundario si está disponible
    if (motoristaId) {
      const channelName = `motorista.${motoristaId}`;
      try {
        const echo = getEcho();
        echo?.private(channelName).listen('.notification.received', handleIncomingNotification);
      } catch (err) {
        console.warn('Echo desacoplado o no disponible:', err);
      }
    }

    return () => {
      clearInterval(pollInterval);
      if (motoristaId) {
        try {
          const echo = getEcho();
          echo?.leave(`motorista.${motoristaId}`);
          disconnectEcho();
        } catch {}
      }
    };
  }, [user, fetchLatestNotifications, handleIncomingNotification]);

  const simulateNotification = (title: string, body: string) => {
    handleIncomingNotification({ titulo: title, mensaje: body });
  };

  return (
    <NotificationContext.Provider value={{ 
      permission, requestPermission, simulateNotification, 
      notifications, refreshNotifications, isLoading, notificationError,
      clearNotifications, markAsRead, markAllAsRead, unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};


