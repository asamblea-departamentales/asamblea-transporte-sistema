import axios from "axios";

export const api = axios.create({
  baseURL: "https://examines-louisville-infant-remote.trycloudflare.com",
  withCredentials: true,
  headers: { 
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest"
  },
});

// ✅ INTERCEPTOR para agregar el token XSRF automáticamente
api.interceptors.request.use((config) => {
  // Obtener el token de las cookies
  const xsrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (xsrfToken) {
    // Decodificar y agregar al header
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
  }
  
  return config;
});

export async function loginRequest(payload: any) {
  await api.get("/sanctum/csrf-cookie");
  const res = await api.post("/login", payload);
  return res.data;
}