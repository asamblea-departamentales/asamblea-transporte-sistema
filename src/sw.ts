/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope

// Ignorar error de ts sobre el ámbito
import { precacheAndRoute } from 'workbox-precaching'

// Precache de los recursos estáticos manejados por Vite PWA
precacheAndRoute(self.__WB_MANIFEST)

// Evento "push": cuando el servidor (Laravel) manda un Web Push
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json()
      // data esperamos que contenga title, body, url...
      const title = data.title || 'Nueva Notificación'
      const options = {
        body: data.body || 'Tienes un nuevo mensaje sobre tu viaje.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        data: {
          url: data.url || '/'
        }
      }

      event.waitUntil(self.registration.showNotification(title, options))
    } catch (e) {
      // Fallback si no es JSON
      event.waitUntil(
        self.registration.showNotification("Notificación Transporte", {
          body: event.data.text(),
        })
      )
    }
  }
})

// Evento "notificationclick": cuando el motorista toca la notificación desde su teléfono
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si ya hay una pantalla de la PWA abierta, enfocarla
      if (windowClients.length > 0) {
        let client = windowClients[0]
        for (let i = 0; i < windowClients.length; i++) {
          if (windowClients[i].focused) {
            client = windowClients[i]
          }
        }
        if ('focus' in client) {
          return client.focus()
        }
      }
      // O abrir una nueva ventana con la url especificada
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
