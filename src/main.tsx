// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/app";
import { AuthProvider } from "./auth/AuthContext";
import { api } from "./lib/axios";
import "leaflet/dist/leaflet.css";

if (import.meta.env.DEV) {
  (window as any).api = api;
  console.log("🔧 api (axios) disponible en DevTools");
  console.log("📍 API Base URL:", api.defaults.baseURL);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
