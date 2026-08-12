/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

interface PushPayload {
  title?: unknown;
  titulo?: unknown;
  body?: unknown;
  mensaje?: unknown;
  icon?: unknown;
  badge?: unknown;
  url?: unknown;
  data?: {
    url?: unknown;
  } | null;
}

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision: string | null }>;
};

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

const textValue = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const getPayload = (event: PushEvent): PushPayload => {
  if (!event.data) return {};

  try {
    const parsed: unknown = event.data.json();
    return parsed && typeof parsed === 'object' ? parsed as PushPayload : {};
  } catch {
    return {
      title: 'Notificación Aprobaciones',
      body: event.data.text()
    };
  }
};

const notificationTarget = (payload: PushPayload): string => {
  const value = textValue(payload.data?.url) ?? textValue(payload.url);
  return value ?? '/notificaciones';
};

self.addEventListener('push', event => {
  const payload = getPayload(event);
  const title = textValue(payload.title) ?? textValue(payload.titulo) ?? 'Sistema de Aprobaciones';
  const body = textValue(payload.body) ?? textValue(payload.mensaje) ??
    'Tienes una nueva solicitud por revisar o actualizar.';
  const target = new URL(notificationTarget(payload), self.location.origin).href;

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: textValue(payload.icon) ?? '/logo.png',
    badge: textValue(payload.badge) ?? '/logo.png',
    data: { url: target }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  let urlToOpen: string;
  try {
    urlToOpen = new URL(
      textValue(event.notification.data?.url) ?? '/notificaciones',
      self.location.origin
    ).href;
  } catch {
    urlToOpen = new URL('/notificaciones', self.location.origin).href;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const exactClient = clientList.find(client => client.url === urlToOpen);
      if (exactClient) return exactClient.focus();

      const clientToUse = clientList.find(client => client.focused) ?? clientList[0];
      if (clientToUse) {
        return clientToUse.navigate(urlToOpen).then(client => client?.focus());
      }

      return self.clients.openWindow?.(urlToOpen);
    })
  );
});
