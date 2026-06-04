import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  date: Date;
  read: boolean;
}

interface NotificationContextProps {
  permission: NotificationPermission | 'default';
  requestPermission: () => Promise<void>;
  simulateNotification: (title: string, body: string) => void;
  notifications: AppNotification[];
  clearNotifications: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextProps>({
  permission: 'default',
  requestPermission: async () => {},
  simulateNotification: () => {},
  notifications: [],
  clearNotifications: () => {},
  markAsRead: () => {},
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
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const clearNotifications = () => setNotifications([]);
  
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

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

  const simulateNotification = (title: string, body: string) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      date: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 1. Feedback Físico y Sonoro
    playChime();
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Dos vibraciones cortas
    }

    // 2. Mostrar in-app (Toast Persistente)
    toast(title, {
      description: body,
      duration: 100000, // Prácticamente infinito, requiere interacción
      action: {
        label: 'Ir al Viaje 🚗',
        onClick: () => {
          markAsRead(newNotif.id);
          navigate('/dashboard'); // Redirigir al dashboard para ver el viaje activo
        },
      },
    });

    // 3. Notificación de Sistema Operativo
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          vibrate: [200, 100, 200],
        } as any);
      });
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      permission, requestPermission, simulateNotification, 
      notifications, clearNotifications, markAsRead, unreadCount 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
