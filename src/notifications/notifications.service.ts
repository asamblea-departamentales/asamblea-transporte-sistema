import { api } from "../lib/api";

export const NOTIFICATIONS_ENDPOINT = "/api/me/notificaciones";
export const NOTIFICATIONS_PAGE_SIZE = 20;

export type NotiTipo =
  | "aprobada"
  | "pre_aprobada"
  | "asignada"
  | "programada"
  | "rechazada"
  | "observada"
  | "en_revision"
  | "finalizada"
  | "cancelada"
  | "recordatorio"
  | "info";

export type NotiModulo = "transporte" | "mantenimiento" | "combustible" | "desconocido";

export type Notification = {
  id: string;
  reqId: number | null;
  tipo: NotiTipo;
  modulo: NotiModulo;
  titulo: string;
  mensaje: string;
  codigo: string;
  ticket: string | null;
  url: string | null;
  leida: boolean;
  createdAt: string;
};

type RecordValue = Record<string, unknown>;

const KNOWN_TYPES = new Set<NotiTipo>([
  "aprobada", "pre_aprobada", "asignada", "programada", "rechazada",
  "observada", "en_revision", "finalizada", "cancelada", "recordatorio", "info",
]);

const MODULE_ALIASES: Record<string, NotiModulo> = {
  transporte: "transporte",
  transport: "transporte",
  "solicitudes-transporte": "transporte",
  mantenimiento: "mantenimiento",
  maintenance: "mantenimiento",
  "solicitudes-mantenimiento": "mantenimiento",
  combustible: "combustible",
  fuel: "combustible",
  "solicitudes-combustible": "combustible",
};

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : value == null ? fallback : String(value);
}

function asNullableString(value: unknown): string | null {
  const normalized = asString(value).trim();
  return normalized ? normalized : null;
}

function asNullableNumber(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
}

export function normalizeNotificationType(value: unknown): NotiTipo {
  const type = asString(value).trim().toLowerCase() as NotiTipo;
  return KNOWN_TYPES.has(type) ? type : "info";
}

export function normalizeNotificationModule(value: unknown): NotiModulo {
  const moduleName = asString(value).trim().toLowerCase();
  return MODULE_ALIASES[moduleName] ?? "desconocido";
}

export function normalizeNotification(item: unknown): Notification | null {
  if (!isRecord(item)) return null;

  const id = asNullableString(item.id);
  if (!id) return null;

  const data = isRecord(item.data) ? item.data : {};
  const reqId = asNullableNumber(data.solicitud_id);

  return {
    id,
    reqId,
    tipo: normalizeNotificationType(data.tipo),
    modulo: normalizeNotificationModule(data.modulo),
    titulo: asString(data.titulo, "Notificación"),
    mensaje: asString(data.mensaje, "Tienes una nueva actualización de tu solicitud."),
    codigo: asString(data.solicitud_codigo),
    ticket: asNullableString(data.ticket),
    url: asNullableString(data.url),
    leida: item.read_at !== null && item.read_at !== undefined,
    createdAt: asString(item.created_at, new Date(0).toISOString()),
  };
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
}

export function normalizeNotificationResponse(payload: unknown, limit = NOTIFICATIONS_PAGE_SIZE): Notification[] {
  const unique = new Map<string, Notification>();

  for (const item of extractItems(payload)) {
    const notification = normalizeNotification(item);
    if (notification && !unique.has(notification.id)) unique.set(notification.id, notification);
  }

  return [...unique.values()].slice(0, limit);
}

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<unknown>(NOTIFICATIONS_ENDPOINT, {
    params: { page: 1, per_page: NOTIFICATIONS_PAGE_SIZE },
  });
  return normalizeNotificationResponse(data);
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await api.put(`${NOTIFICATIONS_ENDPOINT}/${encodeURIComponent(id)}/leer`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await api.put(`${NOTIFICATIONS_ENDPOINT}/marcar-todas`);
}
