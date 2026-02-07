// src/services/auth.service.ts
import { api } from "../lib/axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  roles?: string[];
};

export async function loginRequest(payload: LoginPayload): Promise<AuthUser> {
  // 1️⃣ Generar CSRF + sesión
  await api.get("/sanctum/csrf-cookie");

  // 2️⃣ Login (ruta web que ya tienes)
  await api.post("/login", payload);

  // 3️⃣ Usuario autenticado
  const { data } = await api.get<AuthUser>("/api/user");
  return data;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/user");
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/logout");
}
