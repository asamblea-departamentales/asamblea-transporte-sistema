import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from './types';

export type { NotificationItem, NotificationContextType } from './types';
export { NotificationContext } from './types';
export {
  getCacheKeys,
  clearUserCache,
  clearLegacyCache,
  isValidNotification,
  isStringRecord
} from './cache';
export { normalizeNotification, fetchNotifications } from './notification.service';
export { formatNotificationDate, resolveNotificationPath } from './notification-routing';

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
};
