import { api } from "../shared/lib/api";

export type LoginPayload = { username: string; password: string };

export type AuthUser = {
  id: number | string;
  motorista_id?: number | string | null;
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
  pin: string;
  pin_confirmation: string;
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
  
  if (data && (data.success === false || data.status === 'error' || data.error)) {
    const msg = data.message || data.error || 'Credenciales inválidas.';
    throw new Error(msg);
  }

  const resPayload = data?.data && typeof data.data === 'object' ? data.data : data;
  const user = resPayload?.user || data?.user || (typeof resPayload === 'object' ? resPayload : null);
  const token = resPayload?.token || resPayload?.access_token || data?.token || data?.access_token || '';

  if (!user || !token) {
    const msg = data?.message || 'Credenciales inválidas o respuesta del servidor incompleta.';
    throw new Error(msg);
  }

  // Extraer motorista_id si está en el root del response, resPayload o dentro de user
  const motoristaId = resPayload?.motorista_id ?? data?.motorista_id ?? user?.motorista_id ?? null;
  const fullUser: AuthUser = {
    ...user,
    motorista_id: motoristaId,
  };

  sessionStorage.setItem("auth_token", token);
  const debeCambiar = Boolean(resPayload?.debe_cambiar_password ?? data?.debe_cambiar_password);
  sessionStorage.setItem("debe_cambiar_password", String(debeCambiar));
  
  return {
    user: fullUser,
    token: token,
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
  const rawUser = data?.data?.user || data?.data || data?.user || data;
  if (!rawUser || typeof rawUser !== 'object') {
    throw new Error('No se pudo obtener el perfil del usuario');
  }

  const motoristaId = data?.motorista_id ?? data?.data?.motorista_id ?? rawUser?.motorista_id ?? null;
  return {
    ...rawUser,
    motorista_id: motoristaId,
  } as AuthUser;
}


export async function logoutRequest(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } finally {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("debe_cambiar_password");
  }
}

