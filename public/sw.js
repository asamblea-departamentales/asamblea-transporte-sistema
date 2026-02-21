const CACHE_NAME = 'filament-admin-v1.0.0';

const STATIC_CACHE_URLS = ['/admin', '/admin/login', '/manifest.json'];

const CACHE_PATTERNS = {
  filament_assets: new RegExp('\/css\/filament\/|\/js\/filament\/'),
  images: new RegExp('\.(png|jpg|jpeg|svg|gif|webp|ico)$'),
  fonts: new RegExp('\.(woff|woff2|ttf|eot)$'),
};

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(error => console.error('[SW] Failed to cache:', error))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  if (url.pathname.startsWith('/admin')) {
    event.respondWith(handleAdminRequest(event.request));
  } else if (CACHE_PATTERNS.filament_assets.test(url.pathname)) {
    event.respondWith(handleAssetRequest(event.request));
  } else if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(handleAssetRequest(event.request));
  } else if (CACHE_PATTERNS.fonts.test(url.pathname)) {
    event.respondWith(handleAssetRequest(event.request));
  }
});

async function handleAdminRequest(request) {
  // Nunca cachear navegación HTML (causa error 419 por CSRF)
  if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(getOfflineHTML(), { headers: { 'Content-Type': 'text/html' } });
    }
  }

  // Solo cachear assets (JS, CSS, imágenes)
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function handleAssetRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

function getOfflineHTML() {
  return `<!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sin conexión - Aprobaciones</title>
    </head>
    <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb;">
        <div style="text-align:center;padding:2rem;background:white;border-radius:1rem;box-shadow:0 4px 20px rgba(0,0,0,0.1);max-width:400px;">
            <div style="font-size:4rem;margin-bottom:1rem;">📡</div>
            <h1 style="color:#1e40af;margin-bottom:0.5rem;">Sin conexión</h1>
            <p style="color:#6b7280;margin-bottom:1.5rem;">No se puede conectar al panel de aprobaciones.</p>
            <button onclick="window.location.reload()" style="background:#1e40af;color:white;border:none;padding:0.75rem 1.5rem;border-radius:0.5rem;cursor:pointer;font-size:1rem;">
                Reintentar
            </button>
        </div>
    </body>
    </html>`;
}

self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
  };
  event.waitUntil(
    self.registration.showNotification('Transporte Asamblea - Aprobaciones', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/admin'));
});