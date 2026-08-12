// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/app";
import { AuthProvider } from "./auth/AuthContext";
import "leaflet/dist/leaflet.css";
import { ENV } from "./config/environment";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

console.info(
  `%c 🚀 SISTEMA INSTITUCIONAL - TRANSPORTE %c Modo: ${ENV.mode.toUpperCase()} %c API: ${ENV.apiBaseUrl} `,
  "background: #1e293b; color: #38bdf8; font-weight: bold; padding: 4px; border-radius: 4px 0 0 4px;",
  "background: #0284c7; color: #ffffff; font-weight: bold; padding: 4px;",
  "background: #334155; color: #94a3b8; padding: 4px; border-radius: 0 4px 4px 0;",
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
