import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  // En desarrollo podríamos permitir un fallback, pero en producción es crítico
  if (import.meta.env.PROD) {
    throw new Error("❌ Falta VITE_API_BASE_URL en el entorno de producción");
  }
}

/**
 * Instancia de Axios centralizada para todas las peticiones a la API institucional.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar automáticamente el token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores globales (ej. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.dispatchEvent(new Event("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);
