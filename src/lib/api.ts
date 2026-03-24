import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!BASE_URL) {
  if (import.meta.env.PROD) {
    throw new Error("❌ Falta VITE_API_BASE_URL en el entorno de producción");
  }
}

/**
 * Instancia Axios centralizada para todas las peticiones a la API.
 */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Inyectar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
