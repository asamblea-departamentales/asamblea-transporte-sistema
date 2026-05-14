// src/services/auth.service.ts
import { api } from "../lib/api";

export type LoginPayload = { email: string; password: string };

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  roles: string[];
};
//

export async function loginRequest(payload: LoginPayload): Promise<AuthUser> {
  const { data } = await api.post("/api/auth/login", payload);
  // { message, token, user }
  localStorage.setItem("auth_token", data.token);
  return data.user as AuthUser;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get("/api/auth/me");
  return data as AuthUser;
}

export async function logoutRequest(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    localStorage.removeItem("auth_token");
  }
}
