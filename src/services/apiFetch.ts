const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const isDev = import.meta.env.DEV;

type ApiError = { status: number; message: string; details?: any };

const log = (...args: any[]) => isDev && console.log("[API]", ...args);

async function parseError(res: Response): Promise<ApiError> {
  let message = `Error HTTP ${res.status}`;
  let details: any = undefined;

  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json();
      details = data;
      message = data?.message ?? data?.error ?? message;
    } else {
      const txt = await res.text();
      details = txt;
      if (res.status === 419) {
        message = "CSRF token mismatch.";
      }
    }
  } catch {}

  log("Error parseado:", { status: res.status, message, details });
  return { status: res.status, message, details };
}

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp(`(^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[2]) : null;
}

function logAllCookies() {
  log("🍪 Todas las cookies:", document.cookie);
  log("🔑 XSRF-TOKEN:", getCookie("XSRF-TOKEN"));
  log("🔑 laravel_session:", getCookie("laravel_session"));
}

async function ensureCsrfCookie(): Promise<void> {
  log("📡 Obteniendo CSRF cookie de /sanctum/csrf-cookie");
  
  const res = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include", // ✅ Importante para cookies cross-domain
    headers: { 
      Accept: "application/json",
      Referer: window.location.origin,
      Origin: window.location.origin, // ✅ Agregar Origin
    },
  });
  
  if (!res.ok) {
    log("❌ Error obteniendo CSRF:", res.status, res.statusText);
    throw new Error(`No se pudo obtener CSRF cookie: ${res.status}`);
  }
  
  log("✅ CSRF cookie obtenida");
  await new Promise(resolve => setTimeout(resolve, 200)); // ✅ Mayor espera
  logAllCookies();
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  log(`\n🚀 ${method} ${path}`);
  if (options.body) {
    try {
      log("📦 Body:", JSON.parse(options.body as string));
    } catch {
      log("📦 Body:", options.body);
    }
  }

  if (needsCsrf) {
    await ensureCsrfCookie();
  }

  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("Referer", window.location.origin);
  headers.set("Origin", window.location.origin); // ✅ Agregar Origin

  if (needsCsrf) {
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf) {
      headers.set("X-XSRF-TOKEN", xsrf);
      log("🔐 X-XSRF-TOKEN agregado:", xsrf.substring(0, 30) + "...");
    } else {
      log("⚠️ XSRF-TOKEN NO ENCONTRADO!");
      logAllCookies();
    }
  }

  const doRequest = async () => {
    log("📨 Enviando request a:", `${BASE_URL}${path}`);
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      method,
      credentials: "include", // ✅ Muy importante
      headers,
    });
  };

  let res = await doRequest();
  log(`📬 Respuesta:`, res.status, res.statusText);

  // ✅ Retry en 419
  if (res.status === 419 && needsCsrf) {
    log("⚠️ Error 419, reintentando con nuevo CSRF...");
    await new Promise(resolve => setTimeout(resolve, 300));
    await ensureCsrfCookie();
    
    const xsrf = getCookie("XSRF-TOKEN");
    if (xsrf) {
      headers.set("X-XSRF-TOKEN", xsrf);
      log("🔐 Nuevo XSRF:", xsrf.substring(0, 30) + "...");
    }
    
    res = await doRequest();
    log(`📬 Reintento:`, res.status, res.statusText);
  }

  if (!res.ok) {
    const err = await parseError(res);
    throw new Error(err.message);
  }

  if (res.status === 204) {
    log("✅ 204 No Content");
    return undefined as T;
  }

  const data = await res.json();
  log(`✅ Datos:`, data);
  return data as T;
}