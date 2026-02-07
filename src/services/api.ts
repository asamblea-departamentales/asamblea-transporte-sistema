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
  withXSRFToken: true, // ✅ fuerza X-XSRF-TOKEN
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// Debug útil (solo ver URL + status)
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log("[API REQ]", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
    return config;
  });

  api.interceptors.response.use(
    (res) => {
      console.log("[API RES]", res.status, res.config.url);
      return res;
    },
    (err) => {
      console.log("[API ERR]", err?.response?.status, err?.config?.url, err?.message, err?.response?.data);
      throw err;
    }
  );
}

export async function getCsrfCookie() {
  await api.get("/sanctum/csrf-cookie");
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  await getCsrfCookie();

  // ✅ API login (no /login web)
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
    await api.post("/api/logout");
  } finally {
    authStorage.clearAll();
  }
}
