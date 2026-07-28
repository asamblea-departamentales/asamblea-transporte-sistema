export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  apiBaseUrl: string;
  reverbAppKey: string;
  reverbHost: string;
  reverbPort: number;
  reverbScheme: string;
}

const rawEnv = (import.meta.env.VITE_APP_ENV as EnvironmentMode) || (import.meta.env.PROD ? 'produccion' : 'local');

// Si VITE_API_BASE_URL tiene un valor válido, lo usamos.
// En entorno local (DEV), si no se especificó nada, usamos 'http://127.0.0.1:8000'.
// En producción (PROD), el fallback predeterminado es la URL del backend en Cloudways.
const rawApiUrl = import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim() !== ''
  ? import.meta.env.VITE_API_BASE_URL
  : (import.meta.env.DEV ? 'http://127.0.0.1:8000' : 'https://phplaravel-1581457-6197806.cloudwaysapps.com');

export const ENV: AppEnvironmentConfig = {
  mode: rawEnv,
  isLocal: rawEnv === 'local',
  isPrueba: rawEnv === 'prueba',
  isProduccion: rawEnv === 'produccion',
  apiBaseUrl: rawApiUrl.replace(/\/$/, ''),
  reverbAppKey: import.meta.env.VITE_REVERB_APP_KEY || 'hggzgtp4yx1twnwnqc6u',
  reverbHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  reverbPort: Number(import.meta.env.VITE_REVERB_PORT) || 8080,
  reverbScheme: import.meta.env.VITE_REVERB_SCHEME || 'http',
};

