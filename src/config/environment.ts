export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  apiBaseUrl: string;
  nominatimEmail: string;
}

const rawEnv = (import.meta.env.VITE_APP_ENV as EnvironmentMode) || 'local';
const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.70:8000';
const rawNominatim = import.meta.env.VITE_NOMINATIM_EMAIL || 'app@transporte.institucional.sv';

export const ENV: AppEnvironmentConfig = {
  mode: rawEnv,
  isLocal: rawEnv === 'local',
  isPrueba: rawEnv === 'prueba',
  isProduccion: rawEnv === 'produccion',
  apiBaseUrl: rawApiUrl.replace(/\/$/, ''),
  nominatimEmail: rawNominatim,
};
