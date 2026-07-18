import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from './types';

export type { NotificationItem, NotificationContextType } from './types';
export { NotificationContext } from './types';
export { getCacheKeys, clearUserCache, clearLegacyCache, isValidNotification, isStringRecord, generateId } from './cache';

/**
 * Hook para consumir el contexto de notificaciones.
 * Debe usarse dentro de un NotificationProvider.
 */
export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
};
