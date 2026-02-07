import axios from "axios";

const isDev = import.meta.env.DEV;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  withCredentials: true,
  headers: { 
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔍 Interceptor para debug (solo en desarrollo)
if (isDev) {
  api.interceptors.request.use(
    (config) => {
      console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('[API] 🍪 Cookies:', document.cookie || '(vacío)');
      console.log('[API] 📋 Headers:', config.headers);
      return config;
    },
    (error) => {
      console.error('[API] ❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`[API] ✅ ${response.status} ${response.config.url}`);
      console.log('[API] 🍪 Cookies después:', document.cookie || '(vacío)');
      return response;
    },
    (error) => {
      console.error('[API] ❌ Response error:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
      console.log('[API] 🍪 Cookies en error:', document.cookie || '(vacío)');
      return Promise.reject(error);
    }
  );
}

// Funciones de autenticación
export async function loginRequest(payload: { email: string; password: string }) {
  // 1️⃣ Obtiene XSRF-TOKEN + sesión
  await api.get("/sanctum/csrf-cookie");

  // 2️⃣ Axios manda automáticamente X-XSRF-TOKEN
  const res = await api.post("/login", payload);
  return res.data;
}

export async function meRequest() {
  const res = await api.get("/api/user");
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/logout");
  return res.data;
}