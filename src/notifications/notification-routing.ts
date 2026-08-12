export type NotificationRouteInput = {
  modulo?: string | null;
  solicitudId?: number | null;
  url?: string | null;
};

type RequestModule = "transporte" | "mantenimiento" | "combustible";

const BACKEND_ROUTE_MODULES: Record<string, RequestModule> = {
  "solicitudes-transporte": "transporte",
  "solicitudes-mantenimiento": "mantenimiento",
  "solicitudes-combustible": "combustible",
};

const MODULE_ALIASES: Record<string, RequestModule> = {
  transporte: "transporte",
  transport: "transporte",
  "solicitudes-transporte": "transporte",
  mantenimiento: "mantenimiento",
  maintenance: "mantenimiento",
  "solicitudes-mantenimiento": "mantenimiento",
  combustible: "combustible",
  fuel: "combustible",
  "solicitudes-combustible": "combustible",
};

function moduleFromPath(pathname: string): RequestModule | null {
  const segment = pathname.split("/").filter(Boolean).find((item) => BACKEND_ROUTE_MODULES[item]);
  return segment ? BACKEND_ROUTE_MODULES[segment] ?? null : null;
}

function moduleFromValue(value: string | null | undefined): RequestModule | null {
  if (!value) return null;
  return MODULE_ALIASES[value.trim().toLowerCase()] ?? null;
}

function validRequestId(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? value : null;
}

function requestPath(module: RequestModule | null, solicitudId: number | null | undefined): string | null {
  const routeId = validRequestId(solicitudId);
  return module && routeId ? "/solicitudes/" + module + "/" + routeId : null;
}

export function backendNotificationUrlToPath(url: string | null | undefined, solicitudId?: number | null): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url, "https://notifications.invalid");
    const module = moduleFromPath(parsed.pathname);
    if (!module) return null;

    const segments = parsed.pathname.split("/").filter(Boolean);
    const lastSegment = segments.at(-1);
    const parsedId = lastSegment ? Number(lastSegment) : null;
    return requestPath(module, validRequestId(solicitudId) ?? parsedId);
  } catch {
    return null;
  }
}

export function getNotificationTargetPath({ modulo, solicitudId, url }: NotificationRouteInput): string {
  return backendNotificationUrlToPath(url, solicitudId)
    ?? requestPath(moduleFromValue(modulo), solicitudId)
    ?? "/notificaciones";
}
