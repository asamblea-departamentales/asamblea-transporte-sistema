export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  backendUrl: string;
  apiUrl: string;
}

const rawEnv = (import.meta.env.VITE_APP_ENV as EnvironmentMode) || 'local';
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

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
