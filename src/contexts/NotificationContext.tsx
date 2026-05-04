import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

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

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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
        
        // Si el Service Worker está listo, suscribirse (Aquí se llamaría al backend)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            console.log('SW Ready. Podríamos suscribir usando PushManager:', registration.pushManager);
            // registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: '...' })
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
    // Agregar al historial in-app
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(2, 9),
      title,
      body,
      date: new Date(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // 1. Mostrar in-app (Toast)
    toast(title, {
      description: body,
      action: {
        label: 'Ver',
        onClick: () => markAsRead(newNotif.id),
      },
    });

    // 2. Si hay permiso a nivel SO y estamos en background (simulado usando la API de Notification)
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
        });
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
