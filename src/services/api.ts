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
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔥 INTERCEPTOR para debug
api.interceptors.request.use((config) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 REQUEST:', config.method?.toUpperCase(), config.url);
  console.log('🍪 Cookies actuales:', document.cookie);
  
  const xsrfFromCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  console.log('🔑 Token XSRF en cookies:', xsrfFromCookie);
  console.log('📋 Headers de la petición:', {
    'X-XSRF-TOKEN': config.headers['X-XSRF-TOKEN'],
    'Cookie': config.headers['Cookie'],
    'Accept': config.headers['Accept'],
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log('✅ RESPONSE:', res.status, res.config.url);
    console.log('🍪 Cookies después del response:', document.cookie);
    return res;
  },
  (err) => {
    console.log('❌ ERROR RESPONSE:', {
      status: err?.response?.status,
      url: err?.config?.url,
      message: err?.message,
      data: err?.response?.data
    });
    console.log('🍪 Cookies en el momento del error:', document.cookie);
    throw err;
  }
);

export async function getCsrfCookie() {
  console.log('🔐 Obteniendo CSRF cookie...');
  await api.get("/sanctum/csrf-cookie");
  console.log('✅ CSRF cookie obtenida');
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  console.log('🚀 Iniciando loginRequest...');
  
  // 1. Obtener CSRF
  await getCsrfCookie();
  
  // 2. Esperar un poco para que las cookies se actualicen
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 3. DEBUG: Ver cookies DESPUÉS de esperar
  console.log('🍪 Cookies después de esperar 500ms:', document.cookie);
  
  const xsrfFromCookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  console.log('🔑 Token que axios DEBERÍA usar:', xsrfFromCookie?.substring(0, 50) + '...');
  
  // 4. Login
  console.log('📨 Enviando POST /login...');
  await api.post("/login", payload);
  
  console.log('✅ Login exitoso, obteniendo usuario...');
  const { data: user } = await api.get("/api/user");
  
  authStorage.setAuthFlag(true);
  authStorage.setUser(user);
  
  console.log('✅ loginRequest completado');
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
    await api.post("/logout");
  } finally {
    authStorage.clearAll();
  }
}