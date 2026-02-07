import axios from "axios";

const isDev = import.meta.env.DEV;

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  throw new Error("❌ Falta VITE_API_BASE_URL. Configúrala en Vercel (Preview y Production).");
}

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  withXSRFToken: true, // ✅ clave para mandar X-XSRF-TOKEN
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔍 Debug (solo en desarrollo)
if (isDev) {
  api.interceptors.request.use((config) => {
    console.log(`[API] 📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log("[API] 📋 Headers:", config.headers);
    return config;
  });

  api.interceptors.response.use(
    (res) => {
      console.log(`[API] ✅ ${res.status} ${res.config.url}`);
      return res;
    },
    (err) => {
      console.error("[API] ❌", {
        status: err.response?.status,
        url: err.config?.url,
        data: err.response?.data,
        message: err.message,
      });
      return Promise.reject(err);
    }
  );
}

// ✅ Auth (Sanctum)
export async function loginRequest(payload: { email: string; password: string }) {
  await api.get("/sanctum/csrf-cookie");
  const res = await api.post("/login", payload); // ✅ CAMBIO
  return res.data;
}

export async function meRequest() {
  const res = await api.get("/api/user");
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/api/logout"); // ✅ CAMBIO
  return res.data;
}
