import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ENV } from "./shared/config/environment";

if (ENV.isProduccion) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
} else {
  console.info(
    `%c 🚀 APP MOTORISTA - ASAMBLEA %c Modo: ${ENV.mode.toUpperCase()} %c API: ${ENV.apiBaseUrl} `,
    'background: #1e293b; color: #38bdf8; font-weight: bold; padding: 4px; border-radius: 4px 0 0 4px;',
    'background: #0284c7; color: #ffffff; font-weight: bold; padding: 4px;',
    'background: #334155; color: #94a3b8; padding: 4px; border-radius: 0 4px 4px 0;'
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
