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

function moduleFromPath(pathname: string): RequestModule | null {
  const segment = pathname.split("/").filter(Boolean).find((item) => BACKEND_ROUTE_MODULES[item]);
  return segment ? BACKEND_ROUTE_MODULES[segment] ?? null : null;
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
    const routeId = solicitudId ?? parsedId;
    if (typeof routeId !== "number" || !Number.isSafeInteger(routeId) || routeId <= 0) return null;
    return `/solicitudes/${module}/${routeId}`;
  } catch {
    return null;
  }
}

export function getNotificationTargetPath({ solicitudId, url }: NotificationRouteInput): string {
  return backendNotificationUrlToPath(url, solicitudId) ?? "/notificaciones";
}
