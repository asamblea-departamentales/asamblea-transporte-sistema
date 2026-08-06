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
 * Maneja graciosamente navegadores que bloquean el servicio push (Brave, etc).
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
    const publicKey = await getVapidPublicKey();

    // Validar que la clave tenga formato correcto (base64url, ~87 caracteres para P-256)
    if (!publicKey || publicKey.length < 60) {
      console.warn('[Push] La clave VAPID pública es inválida o está vacía.');
      return false;
    }

    const convertedKey = urlBase64ToUint8Array(publicKey);

    // 2. Esperar a que el Service Worker esté listo con timeout para prevenir bloqueos
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
    ]);

    if (!registration) {
      console.info('[Push] Service worker no listo dentro del tiempo límite (ej. modo desarrollo o SW deshabilitado).');
      return false;
    }

    // 3. Verificar si ya existe una suscripción activa
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 4. Crear nueva suscripción
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      } catch (subscribeError: any) {
        if (subscribeError.name === 'InvalidStateError') {
          // Suscripción vieja con clave diferente — limpiar y reintentar
          const oldSub = await registration.pushManager.getSubscription();
          if (oldSub) await oldSub.unsubscribe();
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
        } else if (subscribeError.name === 'AbortError') {
          // El servicio push no está disponible (Brave bloquea FCM, red corporativa, etc.)
          // No es un error crítico — la app funciona sin push, usa notificaciones in-app.
          console.info(
            '[Push] Notificaciones push nativas no disponibles en este navegador. ' +
            'Las notificaciones in-app seguirán funcionando normalmente. ' +
            '(Si usas Brave, habilita "Use Google services for push messaging" en brave://settings/privacy)'
          );
          return false;
        } else {
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

    // Registrar la suscripción en el backend (probar endpoints según el rol)
    try {
      await api.post('/api/motoristas/me/push-subscribe', payload);
    } catch {
      await api.post('/api/me/push-subscribe', payload);
    }

    return true;
  } catch (error) {
    console.warn('[Push] No se pudo activar push nativo. Las notificaciones in-app siguen activas.', error);
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
