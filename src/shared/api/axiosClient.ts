import axios from 'axios';
import { ENV } from '../config/environment';

export const axiosClient = axios.create({
  baseURL: ENV.apiUrl,
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

// Interceptor global para capturar errores de sesión (401)
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token'); // Limpiar token
      window.location.href = '/login';       // Redirigir al login
    }
    return Promise.reject(error);
  }
);
