/// <reference lib="webworker" />
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { getNotificationTargetPath } from "./notifications/notification-routing";
import { navigateNotificationClick } from "./notifications/service-worker-navigation";

declare let self: ServiceWorkerGlobalScope;

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function stringValue(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return null;
}

function numericValue(value: unknown): number | null {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isSafeInteger(numeric) && numeric > 0 ? numeric : null;
}

function parsePayload(data: PushMessageData | null): JsonRecord {
  if (!data) return {};
  try {
    const parsed: unknown = data.json();
    return isRecord(parsed) ? parsed : {};
  } catch {
    return { body: data.text() };
  }
}

export function getPushTargetPath(payload: JsonRecord): string {
  const nested = isRecord(payload.data) ? payload.data : {};
  return getNotificationTargetPath({
    modulo: stringValue(nested.modulo, payload.modulo),
    solicitudId: numericValue(nested.solicitud_id ?? payload.solicitud_id),
    url: stringValue(nested.url, payload.url),
  });
}

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
clientsClaim();

self.addEventListener("push", (event) => {
  const payload = parsePayload(event.data);
  const nested = isRecord(payload.data) ? payload.data : {};
  const title = stringValue(payload.title, payload.titulo) ?? "Notificación de Transporte";
  const body = stringValue(payload.body, payload.mensaje) ?? "Tienes una nueva actualización de tu solicitud.";
  const targetPath = getPushTargetPath(payload);
  const targetUrl = new URL(targetPath, self.location.origin).href;
  const icon = stringValue(payload.icon, nested.icon) ?? "/icons/icon-192x192.png";
  const badge = stringValue(payload.badge, nested.badge) ?? "/icons/icon-192x192.png";

  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon,
    badge,
    data: { url: targetUrl },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = isRecord(event.notification.data) ? event.notification.data : {};
  const rawUrl = stringValue(data.url) ?? "/notificaciones";
  const urlToOpen = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => (
      navigateNotificationClick(urlToOpen, clientList, () => self.clients.openWindow?.(urlToOpen))
    )),
  );
});
