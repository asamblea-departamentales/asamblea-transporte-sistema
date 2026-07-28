import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { ENV } from '../config/environment';

(window as any).Pusher = Pusher;

let echoInstance: Echo<'pusher'> | null = null;

/**
 * Retorna o crea la instancia singleton de Laravel Echo.
 */
export function getEcho(): Echo<'pusher'> {
  if (!echoInstance) {
    const token = sessionStorage.getItem('auth_token');
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: ENV.reverbAppKey,
      wsHost: ENV.reverbHost,
      wsPort: ENV.reverbPort,
      wssPort: ENV.reverbPort,
      forceTLS: ENV.reverbScheme === 'https',
      enabledTransports: ['ws', 'wss'],
      authEndpoint: `${ENV.apiBaseUrl}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      },
    });
  }
  return echoInstance;
}

/**
 * Desconecta la instancia actual de Echo y limpia la referencia singleton.
 */
export function disconnectEcho() {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch {
      // ignorar errores al desconectar
    }
    echoInstance = null;
  }
}
