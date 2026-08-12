export type EnvironmentMode = 'local' | 'prueba' | 'produccion';

export interface AppEnvironmentConfig {
  mode: EnvironmentMode;
  isLocal: boolean;
  isPrueba: boolean;
  isProduccion: boolean;
  apiBaseUrl: string;
  nominatimEmail: string;
}

const configuredEnv = import.meta.env.VITE_APP_ENV as EnvironmentMode | undefined;
const rawEnv: EnvironmentMode = import.meta.env.PROD
  ? (configuredEnv === 'prueba' ? 'prueba' : 'produccion')
  : (configuredEnv || 'local');
// Los archivos `.env.*` locales estan ignorados por Git y no llegan a Vercel.
// En produccion nunca debemos usar una IP privada de la red local como fallback.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const isPrivateApiUrl = Boolean(configuredApiUrl && /^(https?:\/\/)(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\.)/i.test(configuredApiUrl));
const rawApiUrl = !configuredApiUrl || (import.meta.env.PROD && isPrivateApiUrl)
  ? (import.meta.env.DEV
    ? 'http://192.168.1.70:8000'
    : 'https://phplaravel-1581457-6197806.cloudwaysapps.com')
  : configuredApiUrl;
const rawNominatim = import.meta.env.VITE_NOMINATIM_EMAIL || 'app@transporte.institucional.sv';

export const ENV: AppEnvironmentConfig = {
  mode: rawEnv,
  isLocal: rawEnv === 'local',
  isPrueba: rawEnv === 'prueba',
  isProduccion: rawEnv === 'produccion',
  apiBaseUrl: rawApiUrl.replace(/\/$/, ''),
  nominatimEmail: rawNominatim,
};
