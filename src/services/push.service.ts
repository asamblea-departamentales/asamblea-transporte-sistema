import { api } from "../lib/api";
import { urlBase64ToUint8Array } from "../lib/vapid";

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

export async function getVapidPublicKey(): Promise<string> {
  const { data } = await api.get<VapidPublicKeyResponse>("/api/me/push-public-key");
  if (!data?.public_key) throw new Error("No se pudo obtener la clave pública VAPID del servidor");
  return data.public_key;
}

export async function subscribeUserToPush(): Promise<boolean> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const registration = await navigator.serviceWorker.ready;
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
    if (!serialized.endpoint || !serialized.keys?.p256dh || !serialized.keys.auth) {
      throw new Error("La suscripción push retornó un formato incompleto");
    }

    const payload: PushSubscriptionPayload = {
      endpoint: serialized.endpoint,
      keys: { p256dh: serialized.keys.p256dh, auth: serialized.keys.auth },
    };

    await api.post("/api/me/push-subscribe", payload);
    return true;
  } catch (error) {
    console.error("Error al suscribirse a Web Push:", error);
    return false;
  }
}

export async function unsubscribeUserFromPush(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    await api.delete("/api/me/push-unsubscribe", { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
  } catch (error) {
    console.warn("Error al desuscribir de Web Push:", error);
  }
}
