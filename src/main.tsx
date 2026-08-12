import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './features/Auth/context/AuthContext';
import { NotificationProvider } from './app/providers/NotificationProvider';
import { Toaster } from 'sonner';
import { ENV } from './shared/config/environment';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });

console.info(
  'SISTEMA DE TRANSPORTE - APROBACIONES | Modo: ' + ENV.mode.toUpperCase() +
  ' | API: ' + ENV.apiUrl
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster richColors position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
