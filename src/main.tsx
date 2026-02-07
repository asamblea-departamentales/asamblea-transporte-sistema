import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/app";
import { AuthProvider } from "./auth/AuthContext";

import { api } from './lib/axios.ts'

// ✅ SOLO DEBUG: para usar en DevTools
import axios from "axios";
(window as any).axios = axios;
(window as any).api = api;

// ✅ DEBUG: esto se ejecuta al cargar la app
console.log("BASE URL:", api.defaults.baseURL);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
