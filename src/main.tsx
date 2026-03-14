// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/app";
import { AuthProvider } from "./auth/AuthContext";
import { api } from "./lib/api";
import "leaflet/dist/leaflet.css";

declare global {
  interface Window {
    api: typeof api;
  }
}

if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
}

if (import.meta.env.DEV) {
  window.api = api;
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
