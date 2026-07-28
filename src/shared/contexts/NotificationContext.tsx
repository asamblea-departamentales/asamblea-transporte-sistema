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

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

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
        
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            console.log('SW Ready. Podríamos suscribir usando PushManager:', registration.pushManager);
          });
        }
      } else {
        toast.warning('Notificaciones bloqueadas o denegadas.');
      }
    } catch (error) {
      console.error('Error al pedir permisos:', error);
    }
  };

  const handleIncomingNotification = useCallback((event: any) => {
    const newNotif: AppNotification = {
      id: String(event.id || Math.random().toString(36).substring(2, 9)),
      title: event.titulo || event.title || 'Nueva Notificación',
      body: event.mensaje || event.body || '',
      date: event.created_at ? new Date(event.created_at) : new Date(),
      read: false,
      tipo: event.tipo,
      solicitud_id: event.solicitud_id,
      solicitud_codigo: event.solicitud_codigo,
      ticket: event.ticket,
    };

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

    // 3. Notificación de Sistema Operativo
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(newNotif.title, {
          body: newNotif.body,
          icon: '/icon-192x192.png',
          vibrate: [200, 100, 200],
        } as any);
      });
    }
  }, [markAsRead, navigate]);

  // Cargar notificaciones REST y suscribirse a Echo WebSocket
  useEffect(() => {
    const motoristaId = user?.motorista_id || (user as any)?.id;
    if (!user || !motoristaId) return;

    // 1. Obtener notificaciones previas desde la API REST
    getNotificaciones(1, 20)
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          const list: AppNotification[] = res.data.map((item) => ({
            id: String(item.id),
            title: item.titulo || 'Notificación',
            body: item.mensaje || '',
            date: item.created_at ? new Date(item.created_at) : new Date(),
            read: Boolean(item.read_at),
            tipo: item.tipo,
            solicitud_id: item.solicitud_id,
            solicitud_codigo: item.solicitud_codigo,
            ticket: item.ticket,
          }));
          setNotifications(list);
        }
      })
      .catch((err) => {
        console.warn('No se pudo cargar el historial de notificaciones:', err);
      });

    // 2. Suscribirse al canal privado WebSocket de Laravel Echo
    const channelName = `motorista.${motoristaId}`;
    try {
      const echo = getEcho();
      echo.private(channelName).listen('.notification.received', handleIncomingNotification);
    } catch (err) {
      console.error('Error al suscribirse al canal privado de Echo:', err);
    }

    return () => {
      try {
        const echo = getEcho();
        echo.leave(`motorista.${motoristaId}`);
        disconnectEcho();
      } catch {}
    };
  }, [user, handleIncomingNotification]);

  const simulateNotification = (title: string, body: string) => {
    handleIncomingNotification({ titulo: title, mensaje: body });
  };

  return (
    <NotificationContext.Provider value={{ 
      permission, requestPermission, simulateNotification, 
      notifications, clearNotifications, markAsRead, markAllAsRead, unreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

