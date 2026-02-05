import { tokenStorage } from "../auth/auth.storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

type ApiError = {
  status: number;
  message: string;
  details?: any;
};

async function parseError(res: Response): Promise<ApiError> {
  let message = `Error HTTP ${res.status}`;
  let details: any = undefined;

  try {
    const data = await res.json();
    details = data;
    message = data?.message ?? message;
  } catch {
    // ignore json parse
  }

  return { status: res.status, message, details };
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  // si mandas body json, setea content-type
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // ✅ token
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await parseError(res);
    throw new Error(err.message);
  }

  return (await res.json()) as T;
}
