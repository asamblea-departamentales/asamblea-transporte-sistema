export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  backendUrl: string;
  apiUrl: string;
}

const rawEnv = (import.meta.env.VITE_APP_ENV as EnvironmentMode) || (import.meta.env.PROD ? 'produccion' : 'local');

// Si VITE_BACKEND_URL está definido en las variables de entorno (incluso si es ''), lo respetamos.
// En entorno local (DEV), si no hay VITE_BACKEND_URL, usamos 'http://127.0.0.1:8000'.
// En producción / Vercel, si es '' o undefined, queda '' para usar la ruta relativa '/api' y el proxy de vercel.json.
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL !== undefined
  ? import.meta.env.VITE_BACKEND_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

const cleanBackendUrl = rawBackendUrl.replace(/\/$/, '');
const computedApiUrl = cleanBackendUrl ? `${cleanBackendUrl}/api` : '/api';

export const ENV: AppEnvironmentConfig = {
  mode: rawEnv,
  isLocal: rawEnv === 'local',
  isPrueba: rawEnv === 'prueba',
  isProduccion: rawEnv === 'produccion',
  backendUrl: cleanBackendUrl,
  apiUrl: computedApiUrl,
};

