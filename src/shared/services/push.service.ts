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

const PUSH_LOG = '[PushService]';
const VAPID_ENDPOINT = '/me/push-public-key';
const SUBSCRIBE_ENDPOINT = '/me/push-subscribe';
const UNSUBSCRIBE_ENDPOINT = '/me/push-unsubscribe';

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await axiosClient.get<VapidPublicKeyResponse>(VAPID_ENDPOINT);
  if (!data?.public_key) {
    throw new Error(PUSH_LOG + ' El backend no devolvió public_key.');
  }
  return data.public_key;
}

async function sendSubscriptionToBackend(payload: PushSubscriptionPayload): Promise<void> {
  await axiosClient.post(SUBSCRIBE_ENDPOINT, payload);
}

async function removeSubscriptionFromBackend(subscriptionEndpoint: string): Promise<void> {
  await axiosClient.delete(UNSUBSCRIBE_ENDPOINT, {
    data: { endpoint: subscriptionEndpoint }
  });
}

const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error(PUSH_LOG + ' Service Worker no disponible.');
  }

  return navigator.serviceWorker.ready;
};

export async function enableUserPush(): Promise<boolean> {
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    typeof Notification === 'undefined'
  ) {
    console.warn(PUSH_LOG + ' Web Push no es soportado en este navegador.');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info(PUSH_LOG + ' El usuario no concedió permiso de notificaciones.');
      return false;
    }

    const registration = await getServiceWorkerRegistration();
    const publicKey = await getVapidPublicKey();
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource
      });
    }

    const serialized = subscription.toJSON();
    if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
      throw new Error(PUSH_LOG + ' La suscripción push está incompleta.');
    }

    await sendSubscriptionToBackend({
      endpoint: serialized.endpoint,
      keys: {
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth
      }
    });

    console.info(PUSH_LOG + ' Suscripción registrada en /api/me/push-subscribe.');
    return true;
  } catch (error) {
    console.error(PUSH_LOG + ' Error al activar Web Push:', error);
    return false;
  }
}

export async function disableUserPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    const registration = await getServiceWorkerRegistration();
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    try {
      await removeSubscriptionFromBackend(subscription.endpoint);
    } catch (error) {
      console.error(PUSH_LOG + ' Error al eliminar la suscripción en /api/me/push-unsubscribe:', error);
    }

    await subscription.unsubscribe();
  } catch (error) {
    console.error(PUSH_LOG + ' Error al desactivar Web Push:', error);
  }
}

export const subscribeUserToPush = enableUserPush;
export const unsubscribeUserFromPush = disableUserPush;
