import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/app";
import { AuthProvider } from "./auth/AuthContext";
import { apiFetch } from './services/apiFetch';

if (import.meta.env.DEV) {
  (window as any).apiFetch = apiFetch;
  console.log("🔧 apiFetch disponible en DevTools");
  console.log("📍 API Base URL:", import.meta.env.VITE_API_BASE_URL || "http://localhost:8000");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);