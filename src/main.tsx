import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './features/Auth/context/AuthContext'
import { NotificationProvider } from './app/providers/NotificationProvider'
import { Toaster } from 'sonner'

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
