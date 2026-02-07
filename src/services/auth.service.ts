import { api } from "../lib/axios";

export type LoginPayload = { email: string; password: string };

export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  roles: string[];
};

export async function loginRequest(payload: LoginPayload): Promise<AuthUser> {
  // 1) generar cookie XSRF y sesión
  await api.get("/sanctum/csrf-cookie");

  // 2) login (web route)
  await api.post("/login", payload);

  // 3) traer usuario autenticado
  const { data } = await api.get<AuthUser>("/api/user");
  return data;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/api/user");
  return data;
}

export async function logoutRequest(): Promise<void> {
  // tu backend tiene POST /logout (web.php)
  await api.post("/logout");
}
