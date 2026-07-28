/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { clientsClaim } from 'workbox-core'

declare let self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any[] }

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

self.skipWaiting()
clientsClaim()

// ─── MANEJADOR DE EVENTO PUSH VAPID ─────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let payload: any = {}

  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'Notificación Aprobaciones', body: event.data ? event.data.text() : '' }
  }

  const title = payload.title || payload.titulo || 'Sistema de Aprobaciones'
  const options = {
    body: payload.body || payload.mensaje || 'Tienes una nueva solicitud por revisar o actualizar.',
    icon: payload.icon || '/logo.png',
    badge: payload.badge || '/logo.png',
    data: {
      url: payload.data?.url || payload.url || '/'
    }
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ─── MANEJADOR DE CLIC EN NOTIFICACIONES ────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const relativeUrl = event.notification.data?.url || '/'
  const urlToOpen = new URL(relativeUrl, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }
      if (clientList.length > 0) {
        let clientToUse = clientList[0]
        for (const c of clientList) {
          if (c.focused) {
            clientToUse = c
            break
          }
        }
        return clientToUse.navigate(urlToOpen).then(c => c?.focus())
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen)
      }
    })
  )
})
