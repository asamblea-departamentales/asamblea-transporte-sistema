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
 * Obtiene la clave VAPID exclusivamente para el usuario motorista autenticado.
 */
export async function getVapidPublicKey(): Promise<string> {
  const { data } = await api.get<VapidPublicKeyResponse>(
    '/api/motoristas/me/push-public-key'
  );

  if (!data?.public_key) {
    throw new Error('El servidor no devolvió una clave pública VAPID válida');
  }

  return data.public_key;
}

/**
 * Suscribe el dispositivo actual a Web Push.
 * Si Push no está disponible, la aplicación continúa funcionando con notificaciones in-app.
 */
export async function subscribeUserToPush(
  permissionOverride?: NotificationPermission
): Promise<boolean> {
  if (
    typeof Notification === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    console.warn('[Push] Web Push no es compatible con este navegador.');
    return false;
  }

  try {
    const permission =
      permissionOverride ?? (await Notification.requestPermission());

    if (permission !== 'granted') {
      console.info('[Push] El usuario no concedió permisos de notificación.');
      return false;
    }

    const publicKey = await getVapidPublicKey();

    if (!publicKey || publicKey.length < 60) {
      throw new Error('La clave pública VAPID está vacía o es inválida');
    }

    const convertedKey = urlBase64ToUint8Array(publicKey);
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) =>
        window.setTimeout(() => resolve(null), 2500)
      ),
    ]);

    if (!registration) {
      console.info('[Push] El Service Worker aún no está listo.');
      return false;
    }

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      try {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });
      } catch (subscribeError: unknown) {
        const errorName =
          subscribeError instanceof DOMException
            ? subscribeError.name
            : typeof subscribeError === 'object' &&
                subscribeError !== null &&
                'name' in subscribeError
              ? String((subscribeError as { name?: unknown }).name)
              : '';

        if (errorName === 'InvalidStateError') {
          const oldSubscription =
            await registration.pushManager.getSubscription();

          if (oldSubscription) {
            await oldSubscription.unsubscribe();
          }

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey,
          });
        } else if (errorName === 'AbortError') {
          console.info(
            '[Push] El navegador no tiene disponible el servicio Push. ' +
              'Las notificaciones in-app seguirán funcionando.'
          );
          return false;
        } else {
          throw subscribeError;
        }
      }
    }

    const serialized = subscription.toJSON();

    if (
      !serialized.endpoint ||
      !serialized.keys?.p256dh ||
      !serialized.keys.auth
    ) {
      throw new Error('La suscripción Push retornó un formato incompleto');
    }

    const payload: PushSubscriptionPayload = {
      endpoint: serialized.endpoint,
      keys: {
        p256dh: serialized.keys.p256dh,
        auth: serialized.keys.auth,
      },
    };

    await api.post('/api/motoristas/me/push-subscribe', payload);
    return true;
  } catch (error) {
    console.warn(
      '[Push] No se pudo activar Push. Las notificaciones in-app siguen activas.',
      error
    );
    return false;
  }
}

/**
 * Elimina la suscripción del navegador y del usuario motorista autenticado.
 */
export async function unsubscribeUserFromPush(): Promise<void> {
  if (
    typeof navigator === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return;
    }

    await api.delete('/api/motoristas/me/push-unsubscribe', {
      data: { endpoint: subscription.endpoint },
    });

    await subscription.unsubscribe();
  } catch (error) {
    console.warn('[Push] Error al desuscribir de Web Push:', error);
  }
}
