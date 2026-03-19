// src/notifications/NotificationContext.tsx
import {
  createContext, useContext, useState, useEffect,
  useRef, useCallback, type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type NotiTipo = "aprobada" | "pre_aprobada" | "asignada" | "programada" | "rechazada" | "observada" | "en_revision" | "finalizada" | "cancelada" | "recordatorio" | "info";
export type NotiModulo = "transporte" | "mantenimiento" | "combustible";

export interface Notification {
  id: string;
  reqId: number; // ID numérico para navegación
  tipo: NotiTipo;
  modulo: NotiModulo;
  titulo: string;
  mensaje: string;
  codigo: string;
  leida: boolean;
  createdAt: string;
};

// ─── Internos ──────────────────────────────────────────────────────────────────

type Snap = { id: number; estado: string; fecha_salida: string; codigo: string; modulo: NotiModulo };

const NOTIF_KEY = "app_notifications_v1";
const SNAP_KEY = "app_snap_v1";
const POLL_MS = 60_000;

const load = <T,>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const TIPO_TITULO: Record<NotiTipo, string> = {
  aprobada:     "Solicitud aprobada",
  pre_aprobada: "Solicitud pre-aprobada",
  asignada:     "Solicitud asignada",
  programada:   "Solicitud programada",
  rechazada:    "Solicitud rechazada",
  observada:    "Solicitud observada",
  en_revision:  "Solicitud en revisión",
  finalizada:   "Solicitud finalizada",
  cancelada:    "Solicitud cancelada",
  recordatorio: "Recordatorio de finalización",
  info:         "Actualización",
};

const MODULO_LABEL: Record<NotiModulo, string> = {
  transporte: "Transporte",
  mantenimiento: "Mantenimiento",
  combustible: "Combustible",
};

function buildNotif(snap: Snap, tipo: NotiTipo): Notification {
  const mod = MODULO_LABEL[snap.modulo];
  const mensajes: Record<NotiTipo, string> = {
    aprobada:     `Tu solicitud de ${mod} ${snap.codigo} fue aprobada.`,
    pre_aprobada: `Tu solicitud de ${mod} ${snap.codigo} fue pre-aprobada.`,
    asignada:     `Tu solicitud de ${mod} ${snap.codigo} tiene un motorista/vehículo asignado.`,
    programada:   `Tu solicitud de ${mod} ${snap.codigo} ha sido programada.`,
    rechazada:    `Tu solicitud de ${mod} ${snap.codigo} fue rechazada.`,
    observada:    `Tu solicitud de ${mod} ${snap.codigo} tiene observaciones del supervisor.`,
    en_revision:  `Tu solicitud de ${mod} ${snap.codigo} está en revisión técnica.`,
    finalizada:   `Tu solicitud de ${mod} ${snap.codigo} fue marcada como finalizada.`,
    cancelada:    `Tu solicitud de ${mod} ${snap.codigo} fue cancelada.`,
    recordatorio: `Han pasado más de 24 h desde la fecha de tu solicitud ${snap.codigo}. Recuerda marcarla como finalizada.`,
    info:         `Tu solicitud de ${mod} ${snap.codigo} fue actualizada.`,
  };
  return {
    id: uid(), reqId: snap.id, tipo, modulo: snap.modulo,
    titulo: TIPO_TITULO[tipo], mensaje: mensajes[tipo],
    codigo: snap.codigo, leida: false,
    createdAt: new Date().toISOString(),
  };
}

function estadoATipo(estado: string): NotiTipo | null {
  const e = estado.toLowerCase();
  if (e === "aprobada")     return "aprobada";
  if (e === "pre_aprobada") return "pre_aprobada";
  if (e === "asignada")     return "asignada";
  if (e === "programada")   return "programada";
  if (e === "rechazada")    return "rechazada";
  if (e === "observada")    return "observada";
  if (e === "en_revision")  return "en_revision";
  if (e === "finalizada" || e === "completada") return "finalizada";
  if (e === "cancelada")    return "cancelada";
  return null;
}

function detectar(prev: Snap[], next: Snap[], remindersSent: Set<string>): Notification[] {
  const prevMap = new Map(prev.map(s => [s.id, s]));
  const out: Notification[] = [];

  for (const snap of next) {
    const old = prevMap.get(snap.id);

    // Cambio de estado
    if (old && old.estado !== snap.estado) {
      const tipo = estadoATipo(snap.estado);
      if (tipo) out.push(buildNotif(snap, tipo));
    }

    // Recordatorio 24 h
    if (snap.estado.toLowerCase() === "aprobada" && snap.fecha_salida && !remindersSent.has(snap.codigo)) {
      const horas = (Date.now() - new Date(snap.fecha_salida).getTime()) / 3_600_000;
      if (horas >= 24) {
        remindersSent.add(snap.codigo);
        out.push(buildNotif(snap, "recordatorio"));
      }
    }
  }
  return out;
}

// ─── Contexto ──────────────────────────────────────────────────────────────────

type Ctx = {
  notifications: Notification[];
  unreadCount: number;
  toast: Notification | null;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
  clearToast: () => void;
  spawnTestNotification: () => void;
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
};

const NotifCtx = createContext<Ctx>({
  notifications: [], unreadCount: 0, toast: null,
  markAsRead: () => { }, markAllRead: () => { }, deleteNotification: () => { }, deleteAllNotifications: () => { }, clearToast: () => { },
  spawnTestNotification: () => { },
  permission: "default",
  requestPermission: async () => { },
});

export function useNotifications() { return useContext(NotifCtx); }

// ─── Provider ──────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(() => load(NOTIF_KEY, []));
  const [toast, setToast] = useState<Notification | null>(null);
  const snapRef = useRef<Snap[]>(load(SNAP_KEY, []));
  const remindersRef = useRef<Set<string>>(new Set());
  const isFirstPoll = useRef(true);

  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" ? Notification.permission : "default"
  );

  const unreadCount = notifications.filter(n => !n.leida).length;

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications.slice(0, 100)));
  }, [notifications]);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const res = await Notification.requestPermission();
    setPermission(res);
  };

  const showNativeNotification = useCallback(async (n: Notification) => {
    if (permission !== "granted") return;

    const title = n.titulo;
    const options: NotificationOptions = {
      body: n.mensaje,
      icon: "/icons/icon-192x192.png",
      tag: n.id,
      data: { url: `/solicitudes/${n.modulo}/${n.reqId}` }
    };

    // Intentar vía Service Worker (mejor para Móvil/PWA)
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        reg.showNotification(title, options);
        return;
      }
    }

    // Fallback a Notification API estándar
    const nativeNotif = new Notification(title, options);
    nativeNotif.onclick = () => {
      window.focus();
      navigate(options.data.url);
    };
  }, [permission, navigate]);

  const push = useCallback((incoming: Notification[]) => {
    if (!incoming.length) return;
    const last = incoming[incoming.length - 1];
    setToast(last);
    setNotifications(prev => [...incoming.reverse(), ...prev]);
    showNativeNotification(last);
  }, [showNativeNotification]);

  const poll = useCallback(async () => {
    try {
      const [{ getAllRequests }, { getAllMantenimientos }, { getAllCombustibles }] = await Promise.all([
        import("../services/requests.service"),
        import("../services/mantenimiento.service"),
        import("../services/combustible.service"),
      ]);

      const BIG = 200;
      const [t, m, c] = await Promise.allSettled([
        getAllRequests({ per_page: BIG, page: 1 }),
        getAllMantenimientos({ per_page: BIG, page: 1 }),
        getAllCombustibles({ per_page: BIG, page: 1 }),
      ]);

      const next: Snap[] = [];

      // Helper to process results and potentially fetch page 2 if needed (for notifications we only need recent items)
      if (t.status === "fulfilled") {
        t.value.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "transporte" }));
        // Si hay muchísima actividad, cargamos una página más
        if (t.value.total > t.value.data.length && t.value.data.length < 50) {
           const p2 = await getAllRequests({ per_page: BIG, page: 2 });
           p2.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "transporte" }));
        }
      }
      if (m.status === "fulfilled") {
        m.value.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "mantenimiento" }));
        if (m.value.total > m.value.data.length && m.value.data.length < 50) {
           const p2 = await getAllMantenimientos({ per_page: BIG, page: 2 });
           p2.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "mantenimiento" }));
        }
      }
      if (c.status === "fulfilled") {
        c.value.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "combustible" }));
        if (c.value.total > c.value.data.length && c.value.data.length < 50) {
           const p2 = await getAllCombustibles({ per_page: BIG, page: 2 });
           p2.data.forEach((s) => next.push({ id: Number(s.id), estado: s.estado, fecha_salida: s.fecha_salida ?? "", codigo: s.codigo, modulo: "combustible" }));
        }
      }

      if (isFirstPoll.current) {
        isFirstPoll.current = false;
        snapRef.current = next;
        localStorage.setItem(SNAP_KEY, JSON.stringify(next));
        return;
      }

      const incoming = detectar(snapRef.current, next, remindersRef.current);
      snapRef.current = next;
      localStorage.setItem(SNAP_KEY, JSON.stringify(next));
      push(incoming);
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [push]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  const markAsRead = useCallback((id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, leida: true } : n)), []);
  const markAllRead = useCallback(() => setNotifications(p => p.map(n => ({ ...n, leida: true }))), []);
  const deleteNotification = useCallback((id: string) => setNotifications(p => p.filter(n => n.id !== id)), []);
  const deleteAllNotifications = useCallback(() => setNotifications([]), []);
  const clearToast = useCallback(() => setToast(null), []);

  const spawnTestNotification = useCallback(() => {
    const test: Notification = {
      id: uid(),
      reqId: 123, // Dummy ID for testing
      tipo: "info",
      modulo: "transporte",
      titulo: "Notificación de Prueba",
      mensaje: "Esta es una prueba de notificación interactiva y nativa.",
      codigo: "TEST-123",
      leida: false,
      createdAt: new Date().toISOString(),
    };
    push([test]);
  }, [push]);

  return (
    <NotifCtx.Provider value={{ 
      notifications, unreadCount, toast, markAsRead, markAllRead, deleteNotification, deleteAllNotifications, clearToast, 
      spawnTestNotification, permission, requestPermission 
    }}>
      {children}
    </NotifCtx.Provider>
  );
}