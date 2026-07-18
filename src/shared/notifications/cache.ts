import { NotificationItem } from './types';

/** Claves de caché heredadas (se eliminarán al iniciar) */
const LEGACY_KEYS = {
  notifs: 'jefatura_notifs_v1',
  snapshot: 'jefatura_snap_v1'
} as const;

/** Guard: verifica que el valor sea un objeto plano (no array, no null) */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Guard: verifica que el valor sea Record<string, string> */
export const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (!isRecord(value)) return false;
  return Object.values(value).every(v => typeof v === 'string');
};

/** Guard: verifica que un objeto tenga la estructura válida de NotificationItem */
export const isValidNotification = (item: unknown): item is NotificationItem => {
  if (!isRecord(item)) return false;

  const hasValidId = typeof item.id === 'string' || typeof item.id === 'number';
  const hasValidTitle = typeof item.title === 'string';
  const hasValidDescription = typeof item.description === 'string';
  const hasValidTime = typeof item.time === 'string';
  const hasValidRead = typeof item.read === 'boolean';
  const hasValidActionUrl = typeof item.action_url === 'string';

  return hasValidId && hasValidTitle && hasValidDescription &&
    hasValidTime && hasValidRead && hasValidActionUrl;
};

/**
 * Genera claves de caché únicas por usuario.
 * Usa encodeURIComponent para evitar problemas con caracteres Unicode.
 */
export const getCacheKeys = (userId: number | string) => {
  const encoded = encodeURIComponent(String(userId));
  return {
    notifs: `notifs_${encoded}`,
    snapshot: `snap_${encoded}`
  };
};

/**
 * Genera un ID único con fallback para navegadores antiguos.
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback basado en timestamp + random
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Elimina el caché de un usuario específico.
 */
export const clearUserCache = (userId: number | string) => {
  const keys = getCacheKeys(userId);
  localStorage.removeItem(keys.notifs);
  localStorage.removeItem(keys.snapshot);
};

/**
 * Elimina el caché heredado (jefatura_notifs_v1 y jefatura_snap_v1).
 * Se ejecuta una sola vez al iniciar la aplicación.
 */
export const clearLegacyCache = () => {
  localStorage.removeItem(LEGACY_KEYS.notifs);
  localStorage.removeItem(LEGACY_KEYS.snapshot);
};
