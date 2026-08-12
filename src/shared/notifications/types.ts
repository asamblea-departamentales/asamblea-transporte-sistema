import { createContext } from 'react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  action_url: string;
  type: string;
  module?: string;
  requestId?: string | number;
  requestCode?: string;
  ticket?: string | null;
  createdAt?: string;
}

export interface NotificationContextType {
  notifications: NotificationItem[];
  pendingCount: number;
  isLoading: boolean;
  error: string | null;
  notificationActionError: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllRead: () => Promise<boolean>;
  dismissNotification: (id: string) => void;
  dismissAllNotifications: () => void;
  clearNotificationActionError: () => void;
  retryNotificationAction: () => Promise<boolean>;
  enablePush: () => Promise<boolean>;
  disablePush: () => Promise<void>;
  pushEnabled: boolean;
}

export const NotificationContext = createContext<NotificationContextType | null>(null);
