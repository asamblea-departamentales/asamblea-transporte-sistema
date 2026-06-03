import axios from 'axios';

export const axiosClient = axios.create({
  // Se usa ruta relativa para que las peticiones pasen por el Proxy
  // configurado en vite.config.ts (local) o vercel.json (producción).
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token en cada petición
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
