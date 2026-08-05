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

// ─── Logging helper ──────────────────────────────────────────────────────────
const PUSH_LOG = '[PushService]';

// ─── Endpoint resolution helpers ─────────────────────────────────────────────

/**
 * Intenta obtener la clave pública VAPID del backend.
 * Prueba primero el endpoint de jefatura y si falla intenta el de motoristas,
 * logueando cada paso para facilitar diagnósticos.
 */
export async function getVapidPublicKey(): Promise<string> {
  const endpoints = [
    '/api/me/push-public-key',
    '/api/motoristas/me/push-public-key',
  ];

  for (const url of endpoints) {
    try {
      console.info(`${PUSH_LOG} Solicitando VAPID public key desde ${url}...`);
      const { data } = await axiosClient.get<VapidPublicKeyResponse>(url);
      if (data?.public_key) {
        console.info(`${PUSH_LOG} VAPID public key obtenida desde ${url}`);
        return data.public_key;
      }
      console.warn(`${PUSH_LOG} ${url} respondió pero sin campo public_key`);
    } catch (error) {
      console.warn(`${PUSH_LOG} Fallo al obtener key desde ${url}:`, error);
    }
  }

  throw new Error(`${PUSH_LOG} No se pudo obtener la clave pública VAPID de ningún endpoint`);
}

/**
 * Envía la suscripción push al backend. Intenta el endpoint principal y,
 * si falla, el de motoristas.
 */
async function sendSubscriptionToBackend(payload: PushSubscriptionPayload): Promise<void> {
  const endpoints = [
    '/api/me/push-subscribe',
    '/api/motoristas/me/push-subscribe',
  ];

  for (const url of endpoints) {
    try {
      console.info(`${PUSH_LOG} Registrando suscripción push en ${url}...`);
      await axiosClient.post(url, payload);
      console.info(`${PUSH_LOG} Suscripción registrada exitosamente en ${url}`);
      return;
    } catch (error) {
      console.warn(`${PUSH_LOG} Fallo al registrar suscripción en ${url}:`, error);
    }
  }

  throw new Error(`${PUSH_LOG} No se pudo registrar la suscripción push en ningún endpoint`);
}

/**
 * Notifica al backend que este dispositivo ya no recibirá push.
 */
async function removeSubscriptionFromBackend(subscriptionEndpoint: string): Promise<void> {
  const endpoints = [
    '/api/me/push-unsubscribe',
    '/api/motoristas/me/push-unsubscribe',
  ];

  for (const url of endpoints) {
    try {
      console.info(`${PUSH_LOG} Eliminando suscripción push en ${url}...`);
      await axiosClient.delete(url, { data: { endpoint: subscriptionEndpoint } });
      console.info(`${PUSH_LOG} Suscripción eliminada exitosamente en ${url}`);
      return;
    } catch (error) {
      console.warn(`${PUSH_LOG} Fallo al eliminar suscripción en ${url}:`, error);
    }
  }

  console.error(`${PUSH_LOG} No se pudo eliminar la suscripción push de ningún endpoint`);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Suscribir el dispositivo actual a las notificaciones Push VAPID y enviar
 * las claves al backend.
 */
export async function subscribeUserToPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn(`${PUSH_LOG} Web Push no es soportado en este navegador.`);
    return false;
  }

  console.info(`${PUSH_LOG} Iniciando flujo de suscripción push...`);

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn(`${PUSH_LOG} El usuario denegó los permisos de notificación (permission=${permission}).`);
    return false;
  }
  console.info(`${PUSH_LOG} Permiso de notificación concedido.`);

  try {
    // 1. Obtener Service Worker registration
    let registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<ServiceWorkerRegistration | undefined>((resolve) =>
        setTimeout(async () => {
          try {
            console.info(`${PUSH_LOG} SW.ready tardó >1s, intentando registro manual...`);
            const reg = await navigator.serviceWorker.register('/sw.js');
            resolve(reg);
          } catch (err) {
            console.error(`${PUSH_LOG} Fallo al registrar SW manualmente:`, err);
            resolve(undefined);
          }
        }, 1000)
      ),
    ]);

    if (!registration) {
      console.info(`${PUSH_LOG} Esperando a SW.ready como último recurso...`);
      registration = await navigator.serviceWorker.ready;
    }
    console.info(`${PUSH_LOG} Service Worker registrado.`);

    // 2. Obtener clave VAPID y suscribirse
    const publicKey = await getVapidPublicKey();
    const convertedKey = urlBase64ToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      console.info(`${PUSH_LOG} Suscripción push existente reutilizada.`);
    } else {
      console.info(`${PUSH_LOG} Creando nueva suscripción push...`);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as unknown as BufferSource,
      });
      console.info(`${PUSH_LOG} Nueva suscripción push creada.`);
    }

    // 3. Serializar y validar
    const serialized = subscription.toJSON();
    if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys?.auth) {
      throw new Error(`${PUSH_LOG} La suscripción push retornó un formato incompleto: ${JSON.stringify(serialized)}`);
    }

    // 4. Enviar al backend
    const payload: PushSubscriptionPayload = {
      endpoint: serialized.endpoint,
      keys: {
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth,
      },
    };

    await sendSubscriptionToBackend(payload);
    console.info(`${PUSH_LOG} ✅ Suscripción push completada exitosamente.`);
    return true;
  } catch (error) {
    console.error(`${PUSH_LOG} ❌ Error al suscribirse a Web Push:`, error);
    return false;
  }
}

/**
 * Desuscribir el dispositivo actual del servicio Web Push.
 */
export async function unsubscribeUserFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.info(`${PUSH_LOG} Web Push no soportado, nada que desuscribir.`);
    return;
  }

  console.info(`${PUSH_LOG} Iniciando flujo de desuscripción push...`);

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.info(`${PUSH_LOG} No hay suscripción push activa, nada que desuscribir.`);
      return;
    }

    // Notificar al backend antes de desuscribir localmente
    await removeSubscriptionFromBackend(subscription.endpoint);

    // Desuscribir localmente
    const unsubscribed = await subscription.unsubscribe();
    if (unsubscribed) {
      console.info(`${PUSH_LOG} ✅ Desuscripción push local completada.`);
    } else {
      console.warn(`${PUSH_LOG} subscription.unsubscribe() retornó false.`);
    }
  } catch (error) {
    console.error(`${PUSH_LOG} ❌ Error al desuscribir de Web Push:`, error);
  }
}
