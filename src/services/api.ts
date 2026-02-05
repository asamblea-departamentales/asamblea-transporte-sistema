import type { LoginPayload, LoginResponse } from "../auth/auth.types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * ✅ Laravel recomendado:
 * POST  /api/auth/login
 * body: { email, password }
 * resp: { token: "..." }
 */
export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await safeErrorMessage(res);
    throw new Error(msg);
  }

  return res.json();
}

async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return "Credenciales inválidas.";
  } catch {
    return "No se pudo iniciar sesión.";
  }
}
