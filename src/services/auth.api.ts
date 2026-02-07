// src/services/auth.api.ts
import api from "../lib/axios";
import axios from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  roles: string[];
};

async function csrfCookie(): Promise<void> {
  try {
    await api.get("/sanctum/csrf-cookie");
  } catch (err) {
    console.error("Error obteniendo CSRF cookie:", err);
    throw new Error("No se pudo obtener el token de seguridad CSRF");
  }
}

export async function login(payload: LoginPayload): Promise<void> {
  try {
    await csrfCookie();

    // ✅ Sanctum SPA: LOGIN WEB (no /api/login)
    const response = await api.post("/login", payload);

    console.log("Login exitoso:", response.data);
  } catch (err) {
    console.error("Error en login:", err);
    throw new Error(safeAxiosErrorMessage(err));
  }
}

export async function me(): Promise<AuthUser> {
  try {
    const res = await api.get<AuthUser>("/api/user");
    return res.data;
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    throw new Error(safeAxiosErrorMessage(err));
  }
}

export async function logout(): Promise<void> {
  try {
    await csrfCookie();

    // ✅ Logout web (si tu backend lo tiene así)
    await api.post("/logout");
  } catch (err) {
    console.error("Error en logout:", err);
    throw new Error(safeAxiosErrorMessage(err));
  }
}

function safeAxiosErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;

    if (data?.message) return data.message;
    if (data?.error) return data.error;

    if (status === 401) return "Credenciales inválidas. Verifica tu email y contraseña.";
    if (status === 419) return "Error de seguridad (419). Asegura /sanctum/csrf-cookie → /login y cookies SameSite=None.";
    if (status === 422) {
      if (data?.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) return firstError[0];
      }
      return "Datos inválidos. Verifica los campos.";
    }
    if (status === 500) return "Error del servidor. Contacta al administrador.";

    return `Error HTTP ${status ?? "desconocido"}`;
  }

  return err instanceof Error ? err.message : "No se pudo completar la solicitud. Verifica tu conexión.";
}
