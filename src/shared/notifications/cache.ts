import { NotificationItem } from './types';

const LEGACY_KEYS = {
  notifs: 'jefatura_notifs_v1',
  snapshot: 'jefatura_snap_v1'
} as const;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isStringRecord = (value: unknown): value is Record<string, string> => {
  if (!isRecord(value)) return false;
  return Object.values(value).every(v => typeof v === 'string');
};

export const isValidNotification = (item: unknown): item is NotificationItem => {
  if (!isRecord(item)) return false;

  return typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.time === 'string' &&
    typeof item.read === 'boolean' &&
    typeof item.action_url === 'string' &&
    typeof item.type === 'string';
};

export const getCacheKeys = (userId: number | string) => {
  const encoded = encodeURIComponent(String(userId));
  return {
    notifs: 'app_notifications_v2_' + encoded,
    dismissed: 'app_dismissed_notifications_v1_' + encoded
  };
};

export const clearUserCache = (userId: number | string) => {
  const keys = getCacheKeys(userId);
  localStorage.removeItem(keys.notifs);
  localStorage.removeItem(keys.dismissed);
};

export const clearLegacyCache = () => {
  localStorage.removeItem(LEGACY_KEYS.notifs);
  localStorage.removeItem(LEGACY_KEYS.snapshot);

  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith('notifs_') || key?.startsWith('snap_')) {
      localStorage.removeItem(key);
    }
  }
};
