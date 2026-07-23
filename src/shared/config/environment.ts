export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  apiBaseUrl: string;
}

const rawEnv = (import.meta.env.VITE_APP_ENV as EnvironmentMode) || 'local';
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const ENV: AppEnvironmentConfig = {
  mode: rawEnv,
  isLocal: rawEnv === 'local',
  isPrueba: rawEnv === 'prueba',
  isProduccion: rawEnv === 'produccion',
  apiBaseUrl: rawApiUrl.replace(/\/$/, ''),
};
