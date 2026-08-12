/// <reference lib="webworker" />

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] };

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

function resolveTargetUrl(value: unknown): string {
  const rawUrl =
    typeof value === 'string' && value.trim().length > 0
      ? value
      : '/viajes';

  return new URL(rawUrl, self.location.origin).href;
}

self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json() as {
      title?: unknown;
      body?: unknown;
      url?: unknown;
    };
    const title =
      typeof data.title === 'string' && data.title
        ? data.title
        : 'Nueva notificación';
    const targetUrl = resolveTargetUrl(data.url);

    event.waitUntil(
      self.registration.showNotification(title, {
        body:
          typeof data.body === 'string' && data.body
            ? data.body
            : 'Tienes un nuevo mensaje sobre tu viaje.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: targetUrl,
        },
      })
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('Notificación Transporte', {
        body: event.data.text(),
        data: {
          url: resolveTargetUrl('/viajes'),
        },
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data as
    | { url?: unknown }
    | undefined;
  const targetUrl = resolveTargetUrl(notificationData?.url);

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(async (windowClients) => {
        const client =
          windowClients.find((windowClient) => windowClient.focused) ??
          windowClients[0];

        if (client) {
          try {
            await client.navigate(targetUrl);
          } catch {
            // La ventana puede no permitir navegación; aún se puede enfocar.
          }

          return client.focus();
        }

        return self.clients.openWindow(targetUrl);
      })
  );
});
