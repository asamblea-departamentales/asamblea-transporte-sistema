import { axiosClient } from '../api/axiosClient';
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
 */
export async function getVapidPublicKey(): Promise<string> {
  try {
    const { data } = await axiosClient.get<VapidPublicKeyResponse>('/api/me/push-public-key');
    if (data?.public_key) return data.public_key;
  } catch {
    const { data } = await axiosClient.get<VapidPublicKeyResponse>('/api/motoristas/me/push-public-key');
    return data.public_key;
  }
  throw new Error('No se pudo obtener la clave pública VAPID del servidor');
}

/**
 * Suscribir el dispositivo actual a las notificaciones Push VAPID y enviar las claves al backend.
 */
export async function subscribeUserToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Web Push no es soportado en este navegador.');
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('El usuario denegó los permisos de notificación.');
    return false;
  }

  try {
    let registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration | undefined>((resolve) =>
        setTimeout(async () => {
          try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            resolve(reg);
          } catch {
            resolve(undefined);
          }
        }, 1000)
      ),
    ]);

    if (!registration) {
      registration = await navigator.serviceWorker.ready;
    }
    const publicKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
    }

    const serialized = subscription.toJSON();
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

    try {
      await axiosClient.post('/api/me/push-subscribe', payload);
    } catch {
      await axiosClient.post('/api/motoristas/me/push-subscribe', payload);
    }

    return true;
  } catch (error) {
    console.error('Error al suscribirse a Web Push:', error);
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

    try {
      await axiosClient.delete('/api/me/push-unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });
    } catch {
      await axiosClient.delete('/api/motoristas/me/push-unsubscribe', {
        data: { endpoint: subscription.endpoint },
      });
    }

    await subscription.unsubscribe();
  } catch (error) {
    console.warn('Error al desuscribir de Web Push:', error);
  }
}
