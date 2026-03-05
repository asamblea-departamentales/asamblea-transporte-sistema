// src/notifications/NotificationContext.tsx
import {
  createContext, useContext, useState, useEffect,
  useRef, useCallback, type ReactNode,
} from "react";

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type NotiTipo   = "aprobada" | "rechazada" | "observada" | "finalizada" | "recordatorio" | "info";
export type NotiModulo = "transporte" | "mantenimiento" | "combustible";

export type Notification = {
  id:        string;
  tipo:      NotiTipo;
  modulo:    NotiModulo;
  titulo:    string;
  mensaje:   string;
  codigo:    string;
  leida:     boolean;
  createdAt: string;
};

// ─── Internos ──────────────────────────────────────────────────────────────────

type Snap = { id: number; estado: string; fecha_salida: string; codigo: string; modulo: NotiModulo };

const NOTIF_KEY    = "app_notifications_v1";
const SNAP_KEY     = "app_snap_v1";
const POLL_MS      = 60_000;

const load = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || "") ?? fallback; } catch { return fallback; }
};

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

const TIPO_TITULO: Record<NotiTipo, string> = {
  aprobada:     "Solicitud aprobada",
  rechazada:    "Solicitud rechazada",
  observada:    "Solicitud observada",
  finalizada:   "Solicitud finalizada",
  recordatorio: "Recordatorio de finalización",
  info:         "Actualización",
};

const MODULO_LABEL: Record<NotiModulo, string> = {
  transporte:    "Transporte",
  mantenimiento: "Mantenimiento",
  combustible:   "Combustible",
};

function buildNotif(snap: Snap, tipo: NotiTipo): Notification {
  const mod = MODULO_LABEL[snap.modulo];
  const mensajes: Record<NotiTipo, string> = {
    aprobada:     `Tu solicitud de ${mod} ${snap.codigo} fue aprobada.`,
    rechazada:    `Tu solicitud de ${mod} ${snap.codigo} fue rechazada.`,
    observada:    `Tu solicitud de ${mod} ${snap.codigo} tiene observaciones del supervisor.`,
    finalizada:   `Tu solicitud de ${mod} ${snap.codigo} fue marcada como finalizada.`,
    recordatorio: `Han pasado más de 24 h desde la fecha de tu solicitud ${snap.codigo}. Recuerda marcarla como finalizada.`,
    info:         `Tu solicitud de ${mod} ${snap.codigo} fue actualizada.`,
  };
  return {
    id: uid(), tipo, modulo: snap.modulo,
    titulo: TIPO_TITULO[tipo], mensaje: mensajes[tipo],
    codigo: snap.codigo, leida: false,
    createdAt: new Date().toISOString(),
  };
}

function estadoATipo(estado: string): NotiTipo | null {
  if (estado === "aprobada")                          return "aprobada";
  if (estado === "rechazada")                         return "rechazada";
  if (estado === "observada")                         return "observada";
  if (estado === "finalizada" || estado === "completada") return "finalizada";
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
    if (snap.estado === "aprobada" && snap.fecha_salida && !remindersSent.has(snap.codigo)) {
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
  unreadCount:   number;
  toast:         Notification | null;
  markAsRead:    (id: string) => void;
  markAllRead:   () => void;
  clearToast:    () => void;
};

const NotifCtx = createContext<Ctx>({
  notifications: [], unreadCount: 0, toast: null,
  markAsRead: () => {}, markAllRead: () => {}, clearToast: () => {},
});

export function useNotifications() { return useContext(NotifCtx); }

// ─── Provider ──────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => load(NOTIF_KEY, []));
  const [toast, setToast]                 = useState<Notification | null>(null);
  const snapRef        = useRef<Snap[]>(load(SNAP_KEY, []));
  const remindersRef   = useRef<Set<string>>(new Set());
  const isFirstPoll    = useRef(true);

  const unreadCount = notifications.filter(n => !n.leida).length;

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications.slice(0, 100)));
  }, [notifications]);

  const push = useCallback((incoming: Notification[]) => {
    if (!incoming.length) return;
    setToast(incoming[incoming.length - 1]);
    setNotifications(prev => [...incoming.reverse(), ...prev]);
  }, []);

  const poll = useCallback(async () => {
    try {
      // Importación dinámica para no acoplar el contexto a los servicios concretos
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
      if (t.status === "fulfilled") t.value.data.forEach((s: any) => next.push({ id: s.id, estado: s.estado, fecha_salida: s.fecha_salida, codigo: s.codigo, modulo: "transporte" }));
      if (m.status === "fulfilled") m.value.data.forEach((s: any) => next.push({ id: s.id, estado: s.estado, fecha_salida: s.fecha_salida, codigo: s.codigo, modulo: "mantenimiento" }));
      if (c.status === "fulfilled") c.value.data.forEach((s: any) => next.push({ id: s.id, estado: s.estado, fecha_salida: s.fecha_salida, codigo: s.codigo, modulo: "combustible" }));

      if (isFirstPoll.current) {
        // Primera carga: solo guardar snapshot, sin generar notifs
        isFirstPoll.current = false;
        snapRef.current = next;
        localStorage.setItem(SNAP_KEY, JSON.stringify(next));
        return;
      }

      const incoming = detectar(snapRef.current, next, remindersRef.current);
      snapRef.current = next;
      localStorage.setItem(SNAP_KEY, JSON.stringify(next));
      push(incoming);
    } catch (e) {
      console.warn("[Notifications] poll error:", e);
    }
  }, [push]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  const markAsRead  = useCallback((id: string) => setNotifications(p => p.map(n => n.id === id ? { ...n, leida: true } : n)), []);
  const markAllRead = useCallback(() => setNotifications(p => p.map(n => ({ ...n, leida: true }))), []);
  const clearToast  = useCallback(() => setToast(null), []);

  return (
    <NotifCtx.Provider value={{ notifications, unreadCount, toast, markAsRead, markAllRead, clearToast }}>
      {children}
    </NotifCtx.Provider>
  );
}