// src/services/api.ts
import axios from "axios";
import { authStorage } from "../auth/auth.storage";
import type { LoginPayload, LoginResponse } from "../auth/auth.types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error("❌ Falta VITE_API_BASE_URL (Vercel Preview/Production).");
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true, // ✅ CLAVE para evitar 419 (manda X-XSRF-TOKEN)
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔥 DEBUG solo en dev
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log("[API REQ]", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    console.log("[API REQ HEADERS]", config.headers);
    return config;
  });

  api.interceptors.response.use(
    (res) => {
      console.log("[API RES]", res.status, res.config.url);
      return res;
    },
    (err) => {
      console.log("[API ERR]", err?.response?.status, err?.config?.url, err?.message);
      throw err;
    }
  );
}

export async function getCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  await getCsrfCookie();
  
  // AGREGAR ESTO 👇
  console.log('🍪 Cookies después de CSRF:', document.cookie);
  
  const xsrfFromCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  console.log('🔑 Token que axios debería usar:', xsrfFromCookie);
  // 👆 HASTA AQUÍ
  
  await api.post("/login", payload);
  
  const { data: user } = await api.get("/api/user");
  authStorage.setAuthFlag(true);
  authStorage.setUser(user);
  return { user };
}

export async function meRequest() {
  const { data } = await api.get("/api/user");
  authStorage.setAuthFlag(true);
  authStorage.setUser(data);
  return data;
}

export async function logoutRequest() {
  try {
    await api.post("/logout"); // o "/api/logout"
  } finally {
    authStorage.clearAll();
  }
}
