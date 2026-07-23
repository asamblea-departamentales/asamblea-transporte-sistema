import { api } from "../shared/lib/api";

export type LoginPayload = { username: string; password: string };

export type AuthUser = {
  id: number | string;
  name: string;
  email: string;
  username?: string;
  roles: string[];
  unidad?: string | null;
};

export type LoginResult = {
  user: AuthUser;
  token: string;
  debe_cambiar_password: boolean;
  message?: string;
};

export type ActivarCuentaPayload = {
  numero_expediente: string;
  telefono: string;
};

export type ActivarCuentaData = {
  nombre: string;
  username: string;
  pin_temporal: string;
};

export type ActivarCuentaResponse = {
  status: boolean;
  message: string;
  data: ActivarCuentaData;
};

export type CambiarPinPayload = {
  password: string;
  password_confirmation: string;
};

export type CambiarPinResponse = {
  status: boolean;
  message: string;
};

export async function activarCuentaRequest(
  payload: ActivarCuentaPayload
): Promise<ActivarCuentaResponse> {
  const { data } = await api.post<ActivarCuentaResponse>(
    "/api/auth/motorista/activar-cuenta",
    payload
  );
  return data;
}

export async function loginRequest(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await api.post("/api/auth/login", payload);
  sessionStorage.setItem("auth_token", data.token);
  const debeCambiar = Boolean(data.debe_cambiar_password);
  sessionStorage.setItem("debe_cambiar_password", String(debeCambiar));
  
  return {
    user: data.user as AuthUser,
    token: data.token,
    debe_cambiar_password: debeCambiar,
    message: data.message,
  };
}

export async function cambiarPinInicialRequest(
  payload: CambiarPinPayload
): Promise<CambiarPinResponse> {
  const { data } = await api.post<CambiarPinResponse>(
    "/api/auth/motorista/cambiar-pin-inicial",
    payload
  );
  sessionStorage.setItem("debe_cambiar_password", "false");
  return data;
}

export async function meRequest(): Promise<AuthUser> {
  const { data } = await api.get("/api/auth/me");
  return data as AuthUser;
}

export async function logoutRequest(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("debe_cambiar_password");
  }
}

