import { api } from '../lib/api';
import { urlBase64ToUint8Array } from '../lib/vapid';

export interface VapidPublicKeyResponse {
  public_key: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Obtener la clave pública VAPID desde el backend API.
 * Intenta primero en /api/motoristas/me/push-public-key y como fallback /api/me/push-public-key
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const { data } = await api.get<VapidPublicKeyResponse>('/api/motoristas/me/push-public-key');
    if (data?.public_key) return data.public_key;
  } catch {
    // Fallback al endpoint genérico
    try {
      const { data } = await api.get<VapidPublicKeyResponse>('/api/me/push-public-key');
      if (data?.public_key) return data.public_key;
    } catch {
      // Ambos endpoints fallaron
    }
  }
  throw new Error('No se pudo obtener la clave pública VAPID del servidor');
}

/**
 * Suscribir el dispositivo actual a las notificaciones Push VAPID y enviar las claves al backend.
 */
export async function subscribeUserToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[Push] Web Push no es soportado en este navegador.');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('[Push] El usuario denegó los permisos de notificación.');
    return false;
  }

  try {
    // 1. Obtener la clave VAPID del backend
    console.log('[Push] Paso 1: Obteniendo clave VAPID del servidor...');
    const publicKey = await getVapidPublicKey();

    // Validar que la clave tenga formato correcto (base64url, ~87 caracteres para P-256)
    if (!publicKey || publicKey.length < 60) {
      console.error('[Push] ❌ La clave VAPID pública es inválida o está vacía. Longitud:', publicKey?.length, 'Valor:', publicKey);
      return false;
    }
    console.log('[Push] ✅ Clave VAPID obtenida. Longitud:', publicKey.length);

    const convertedKey = urlBase64ToUint8Array(publicKey);
    console.log('[Push] ✅ Clave convertida a Uint8Array. Bytes:', convertedKey.length);

    // 2. Esperar a que el Service Worker esté listo (VitePWA ya lo registra)
    console.log('[Push] Paso 2: Esperando Service Worker...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] ✅ Service Worker activo. Scope:', registration.scope);

    // 3. Verificar si ya existe una suscripción activa
    console.log('[Push] Paso 3: Verificando suscripción existente...');
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[Push] ✅ Suscripción existente encontrada. Endpoint:', subscription.endpoint.substring(0, 80) + '...');
    } else {
      // 4. Crear nueva suscripción
      console.log('[Push] Paso 4: Creando nueva suscripción push...');
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
        console.log('[Push] ✅ Suscripción creada exitosamente.');
      } catch (subscribeError: any) {
        // Si falla porque hay una suscripción vieja con otra clave, limpiar y reintentar
        if (subscribeError.name === 'InvalidStateError') {
          console.warn('[Push] Suscripción vieja con clave diferente detectada. Limpiando...');
          const oldSub = await registration.pushManager.getSubscription();
          if (oldSub) await oldSub.unsubscribe();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
          console.log('[Push] ✅ Suscripción creada tras limpiar la anterior.');
        } else {
          console.error('[Push] ❌ Error en pushManager.subscribe():', subscribeError.name, subscribeError.message);
          console.error('[Push] 💡 Posibles causas:');
          console.error('    - El navegador no puede contactar el servicio push (FCM)');
          console.error('    - La clave VAPID del servidor es inválida o está corrupta');
          console.error('    - Hay un Service Worker viejo cacheado (limpiar en DevTools → Application → Service Workers → Unregister)');
          console.error('    - Red corporativa/firewall bloqueando fcm.googleapis.com');
          throw subscribeError;
        }
      }
    }

    // 5. Serializar y enviar al backend
    const serialized = subscription!.toJSON();
    if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
      throw new Error('La suscripción push retornó un formato incompleto');
    }

    const payload: PushSubscriptionPayload = {
      endpoint: serialized.endpoint,
      keys: {
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth,
      },
    };

    console.log('[Push] Paso 5: Registrando suscripción en el backend...');
    try {
      await api.post('/api/motoristas/me/push-subscribe', payload);
    } catch {
      await api.post('/api/me/push-subscribe', payload);
    }

    console.log('[Push] ✅ ¡Suscripción Web Push completada exitosamente!');
    return true;
  } catch (error) {
    console.error('[Push] ❌ Error al suscribirse a Web Push:', error);
    return false;
  }
}

/**
 * Desuscribir el dispositivo actual del servicio Web Push.
 */
export async function unsubscribeUserFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return;

    // Notificar al backend que se eliminará la suscripción
    try {
      await api.delete('/api/motoristas/me/push-unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });
    } catch {
      await api.delete('/api/me/push-unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });
    }

    // Desuscribir en el navegador
    await subscription.unsubscribe();
  } catch (error) {
    console.warn('[Push] Error al desuscribir de Web Push:', error);
  }
}
