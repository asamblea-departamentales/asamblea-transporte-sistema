export interface NotificationRouteInput {
  url?: string;
  module?: string;
  requestCode?: string;
}

const FALLBACK_PATH = '/notificaciones';

const validFrontendPath = (pathname: string): string | null => {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  if (/^\/aprobaciones\/[^/]+$/.test(normalized)) return normalized;
  if (/^\/mantenimiento\/aprobaciones\/[^/]+$/.test(normalized)) return normalized;
  if (/^\/combustible\/aprobaciones\/[^/]+$/.test(normalized)) return normalized;
  return null;
};

const convertLegacyPath = (pathname: string): string | null => {
  const matchers: Array<[RegExp, string]> = [
    [/^\/solicitudes-transporte\/([^/]+)\/?$/, '/aprobaciones/$1'],
    [/^\/solicitudes-mantenimiento\/([^/]+)\/?$/, '/mantenimiento/aprobaciones/$1'],
    [/^\/solicitudes-combustible\/([^/]+)\/?$/, '/combustible/aprobaciones/$1']
  ];

  for (const [matcher, replacement] of matchers) {
    const match = pathname.match(matcher);
    if (match) return replacement.replace('$1', match[1]);
  }

  return null;
};

const pathFromUrl = (value: string): string | null => {
  try {
    const parsed = new URL(
      value,
      typeof window === 'undefined' ? 'https://notifications.invalid' : window.location.origin
    );
    return validFrontendPath(parsed.pathname) ?? convertLegacyPath(parsed.pathname);
  } catch {
    return null;
  }
};

const modulePath = (module: string | undefined, code: string | undefined): string | null => {
  if (!module || !code) return null;
  const normalizedModule = module.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const encodedCode = encodeURIComponent(code);

  if (normalizedModule.includes('mantenimiento')) return '/mantenimiento/aprobaciones/' + encodedCode;
  if (normalizedModule.includes('combustible')) return '/combustible/aprobaciones/' + encodedCode;
  if (normalizedModule.includes('transporte')) return '/aprobaciones/' + encodedCode;
  return null;
};

export const resolveNotificationPath = (input: NotificationRouteInput): string => {
  const fromUrl = input.url ? pathFromUrl(input.url) : null;
  return fromUrl ?? modulePath(input.module, input.requestCode) ?? FALLBACK_PATH;
};

export const formatNotificationDate = (createdAt?: string): string => {
  if (!createdAt) return 'Fecha no disponible';
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';

  return new Intl.DateTimeFormat('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export const NOTIFICATIONS_FALLBACK_PATH = FALLBACK_PATH;
