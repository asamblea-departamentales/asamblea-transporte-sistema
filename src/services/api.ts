import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔥 DEBUG (temporal)
api.interceptors.request.use((config) => {
  console.log("[API REQ]", config.method?.toUpperCase(), config.url, {
    baseURL: config.baseURL,
    withCredentials: config.withCredentials,
    xsrfCookieName: config.xsrfCookieName,
    xsrfHeaderName: config.xsrfHeaderName,
    headers: config.headers,
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

export async function loginRequest(payload: any) {
  await api.get("/sanctum/csrf-cookie");      // ✅ debe verse en consola
  const res = await api.post("/login", payload);
  return res.data;
}