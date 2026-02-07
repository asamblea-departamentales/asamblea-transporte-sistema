import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error("❌ Falta VITE_API_BASE_URL.");
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Sanctum SPA
api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// Debug opcional
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log("[API]", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    return config;
  });
}
