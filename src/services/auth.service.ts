import { apiFetch } from "./apiFetch";

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

export type LoginResponse = {
  user: AuthUser;
};

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  await apiFetch("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  
  const user = await apiFetch<AuthUser>("/api/user", {
    method: "GET",
  });
  
  return { user };
}

export async function meRequest(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/user", {
    method: "GET",
  });
}

export async function logoutRequest(): Promise<void> {
  await apiFetch("/logout", {
    method: "POST",
  });
}