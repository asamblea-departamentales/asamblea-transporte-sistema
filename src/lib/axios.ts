import axios from "axios";

const isDev = import.meta.env.DEV;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error("❌ Falta VITE_API_BASE_URL. Configúrala en Vercel (Preview y Production).");
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true, // ✅ CLAVE para evitar 419 en cross-site
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔍 Debug (solo en desarrollo)
if (isDev) {
  api.interceptors.request.use(
    (config) => {
      console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      console.log("[API] 📋 Headers:", config.headers);
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`[API] ✅ ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error("[API] ❌", {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

// ✅ Auth (Sanctum)
export async function loginRequest(payload: { email: string; password: string }) {
  await api.get("/sanctum/csrf-cookie");
  const res = await api.post("/login", payload); // si tu backend usa /api/login, cámbialo
  return res.data;
}

export async function meRequest() {
  const res = await api.get("/api/user");
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/logout"); // si tu backend usa /api/logout, cámbialo
  return res.data;
}
