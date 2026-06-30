import { useState, useEffect, useCallback } from 'react';
import { dashboardApi, RecentRequest } from '../../features/Aprobacion/api/dashboardApi';
import { NotificationItem } from '../components/NotificationPanel';

const SNAP_KEY = 'jefatura_snap_v1';
const NOTIF_KEY = 'jefatura_notifs_v1';
const POLL_MS = 60000;

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

export function useNotifications(user: any) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Load from local storage initially
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setPendingCount(parsed.filter((n: NotificationItem) => !n.read).length);
      }
    } catch (e) {}
  }, []);

  const fetchAndCompare = useCallback(async () => {
    if (!user?.roles?.some((r: string) => ['jefe', 'admin', 'ti', 'super_admin'].includes(r))) return;

    try {
      const reqData = await dashboardApi.getRecentRequests();
      const rows: RecentRequest[] = Array.isArray(reqData) ? reqData : (reqData.data || []);
      
      // Filtrar solo las que le importan al jefe (pre_aprobadas)
      const currentItems = rows.filter(req => {
        if (!req.status) return false;
        const statusVal = typeof req.status === 'string' ? req.status : (req.status as any).value || '';
        return statusVal.toLowerCase().includes('pre');
      });

      // Load snapshot
      let snapshot: Record<string, string> = {};
      try {
        const storedSnap = localStorage.getItem(SNAP_KEY);
        if (storedSnap) snapshot = JSON.parse(storedSnap);
      } catch (e) {}

      // Compare
      let newNotifs: NotificationItem[] = [];
      let newSnapshot: Record<string, string> = {};

      currentItems.forEach(req => {
        const idStr = String(req.id || req.code);
        newSnapshot[idStr] = 'pre_aprobada';

        // Si este id no existía en el snapshot anterior, es una nueva solicitud que requiere atención
        if (!snapshot[idStr]) {
          const typeLabel = req.type?.toLowerCase() === 'combustible' ? 'combustible' : 'transporte';
          const actionUrl = typeLabel === 'combustible' ? `/combustible/aprobaciones/${req.code}` : `/aprobaciones/${req.code}`;
          
          newNotifs.push({
            id: uid(),
            title: `Nueva Solicitud: ${req.code}`,
            description: `Se requiere aprobación para esta solicitud de ${typeLabel}.`,
            time: 'Justo ahora',
            read: false,
            action_url: actionUrl
          });
        }
      });

      // Save snapshot
      localStorage.setItem(SNAP_KEY, JSON.stringify(newSnapshot));

      // Append new notifications
      if (newNotifs.length > 0) {
        setNotifications(prev => {
          const combined = [...newNotifs, ...prev].slice(0, 20); // Keep last 20
          localStorage.setItem(NOTIF_KEY, JSON.stringify(combined));
          setPendingCount(combined.filter(n => !n.read).length);
          return combined;
        });
      }

    } catch (error) {
      console.error("Error fetching notifications via polling", error);
    }
  }, [user]);

  useEffect(() => {
    fetchAndCompare();
    const interval = setInterval(fetchAndCompare, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchAndCompare]);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setPendingCount(0);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setPendingCount(0);
    localStorage.removeItem(NOTIF_KEY);
  };

  return { notifications, pendingCount, markAllAsRead, clearNotifications };
}
