import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { ENV } from '../config/environment';

(window as any).Pusher = Pusher;

let echoInstance: Echo<'pusher'> | null = null;

/**
 * Retorna o crea de forma segura la instancia singleton de Laravel Echo.
 */
export function getEcho(): Echo<'pusher'> | null {
  if (!echoInstance) {
    try {
      const token = sessionStorage.getItem('auth_token');
      echoInstance = new Echo({
        broadcaster: 'pusher',
        key: ENV.reverbAppKey || 'hggzgtp4yx1twnwnqc6u',
        wsHost: ENV.reverbHost || 'localhost',
        wsPort: ENV.reverbPort || 8080,
        wssPort: ENV.reverbPort || 8080,
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
    } catch (err) {
      console.warn('No se pudo inicializar Laravel Echo:', err);
      return null;
    }
  }
  return echoInstance;
}

/**
 * Desconecta la instancia actual de Echo si existe.
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
