// src/services/api.ts
import axios from "axios";
import { authStorage } from "../auth/auth.storage";
import type { LoginPayload, LoginResponse } from "../auth/auth.types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔥 DEBUG (temporal) solo en dev
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log("[API REQ]", config.method?.toUpperCase(), config.url, {
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
    });
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

  // ✅ usa el endpoint real de tu backend:
  await api.post("/api/login", payload); // si tu backend es /login, cambia a "/login"

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
    await api.post("/api/logout"); // si tu backend es /logout, cambia a "/logout"
  } finally {
    authStorage.clearAll();
  }
}
