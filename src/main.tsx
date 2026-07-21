import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './features/Auth/context/AuthContext'
import { NotificationProvider } from './app/providers/NotificationProvider'
import { Toaster } from 'sonner'
import { ENV } from './shared/config/environment'

// Log de diagnóstico en consola (F12)
console.info(
  `%c 🚀 SISTEMA DE TRANSPORTE - APROBACIONES %c Modo: ${ENV.mode.toUpperCase()} %c API: ${ENV.apiUrl} `,
  'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 4px; border-radius: 4px 0 0 4px;',
  'background: #0284c7; color: #ffffff; font-weight: bold; padding: 4px;',
  'background: #334155; color: #94a3b8; padding: 4px; border-radius: 0 4px 4px 0;'
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
        <Toaster richColors position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
