import { createContext } from 'react';

export interface NotificationItem {
  id: string | number;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action_url: string;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  pendingCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  deleteNotification: (id: string | number) => void;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);
