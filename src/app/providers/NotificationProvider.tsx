import React, { useState, useEffect, useRef, useMemo, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from '@/features/Auth/context/AuthContext';
import { dashboardApi, RecentRequest } from '@/features/Aprobacion/api/dashboardApi';
import { hasJefaturaAccess } from '@/shared/auth/roles';
import {
  NotificationContext,
  NotificationItem
} from '@/shared/notifications/types';
import {
  getCacheKeys,
  clearUserCache,
  clearLegacyCache,
  isValidNotification,
  isStringRecord,
  generateId
} from '@/shared/notifications/cache';
import { subscribeUserToPush } from '@/shared/services/push.service';

const POLL_MS = 60000;

/** Carga notificaciones del caché de forma segura */
function loadCachedNotifications(key: string): NotificationItem[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidNotification);
  } catch {
    localStorage.removeItem(key);
    return [];
  }
}

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [hydratedUserId, setHydratedUserId] = useState<number | string | null>(null);

  const previousUserIdRef = useRef<number | string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canAccess = useMemo(() => hasJefaturaAccess(user?.roles), [user?.roles]);

  // 1. Clear legacy cache (una vez al montar)
  useEffect(() => {
    clearLegacyCache();
  }, []);

  const pendingCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  // 2. Sesión + polling (DECLARADO PRIMERO)
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    // Bloquear persistencia durante hidratación
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydratedUserId(null);
    setNotifications([]);

    if (previousUserId !== null && previousUserId !== currentUserId) {
      clearUserCache(previousUserId);
    }

    previousUserIdRef.current = currentUserId;

    if (currentUserId === null) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Cargar caché del nuevo usuario
    const keys = getCacheKeys(currentUserId);
    const cached = loadCachedNotifications(keys.notifs);
    setNotifications(cached);

    // Señalar hidratación completada
    setHydratedUserId(currentUserId);

    // Auto-suscribir a notificaciones push VAPID
    subscribeUserToPush().catch((err) => {
      console.warn('[NotificationProvider] Error al suscribirse a Push:', err);
    });

    if (!canAccess) return;

    let isFetching = false;
    let isActive = true;
    const controller = new AbortController();

    const poll = async () => {
      if (isFetching || !isActive) return;
      isFetching = true;
      try {
        const reqData = await dashboardApi.getRecentRequests(controller.signal);

        if (!isActive) return;

        const rows: RecentRequest[] = reqData?.data ?? [];

        const currentItems = rows.filter((req: RecentRequest) => {
          const statusVal = typeof req.status === 'string' ? req.status : '';
          return statusVal.toLowerCase().includes('pre');
        });

        let snapshot: Record<string, string> = {};
        try {
          const storedSnap = localStorage.getItem(keys.snapshot);
          if (storedSnap) {
            const parsed: unknown = JSON.parse(storedSnap);
            if (isStringRecord(parsed)) {
              snapshot = parsed;
            }
          }
        } catch {
          localStorage.removeItem(keys.snapshot);
        }

        const newNotifs: NotificationItem[] = [];
        const newSnapshot: Record<string, string> = {};

        currentItems.forEach((req) => {
          const idStr = req.code || String(req.id);
          newSnapshot[idStr] = 'pre_aprobada';

          if (!snapshot[idStr]) {
            const typeLabel = req.type?.toLowerCase() || 'transporte';
            const actionUrl = typeLabel === 'combustible' ? `/combustible/aprobaciones/${req.code}`
              : typeLabel === 'mantenimiento' ? `/mantenimiento/aprobaciones/${req.code}`
                : `/aprobaciones/${req.code}`;

            newNotifs.push({
              id: generateId(),
              title: `Nueva Solicitud: ${req.code}`,
              description: `Se requiere aprobación para esta solicitud de ${typeLabel}.`,
              time: 'Justo ahora',
              read: false,
              action_url: actionUrl
            });
          }
        });

        localStorage.setItem(keys.snapshot, JSON.stringify(newSnapshot));

        if (!isActive) return;

        setNotifications((prev) => {
          const currentIds = currentItems.map((r) => r.code || String(r.id));
          const filteredPrev = prev.filter((n) => {
            const match = n.action_url.match(/([^/]+)$/);
            const reqCode = match ? match[1] : '';
            return currentIds.includes(reqCode);
          });

          return [...newNotifs, ...filteredPrev].slice(0, 20);
        });
      } catch (error) {
        if (isActive && !axios.isCancel(error)) {
          console.error('Error fetching notifications', error);
        }
      } finally {
        if (isActive) isFetching = false;
      }
    };

    poll();
    intervalRef.current = setInterval(poll, POLL_MS);

    return () => {
      isActive = false;
      setHydratedUserId(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      controller.abort();
    };
  }, [user?.id, canAccess]);

  // 3. Persistir notificaciones (DECLARADO DESPUÉS, solo tras hidratación)
  useEffect(() => {
    if (user?.id == null || hydratedUserId !== user.id) return;

    const keys = getCacheKeys(user.id);
    if (notifications.length === 0) {
      localStorage.removeItem(keys.notifs);
    } else {
      localStorage.setItem(keys.notifs, JSON.stringify(notifications));
    }
  }, [notifications, user?.id, hydratedUserId]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const deleteNotification = useCallback((id: string | number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      pendingCount,
      markAllAsRead,
      clearNotifications,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
