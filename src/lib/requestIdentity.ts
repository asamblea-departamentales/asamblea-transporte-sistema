export type RequestModule = "transporte" | "mantenimiento" | "combustible";

export type RequestIdentity = {
  modulo: RequestModule;
  id: number;
  codigo: string;
};

export function getRequestKey(request: Pick<RequestIdentity, "modulo" | "id">): string {
  return `${request.modulo}:${request.id}`;
}

export function getRequestRouteIdentifier(request: RequestIdentity): string {
  return request.modulo === "mantenimiento" ? String(request.id) : request.codigo;
}

export function getRequestDetailPath(request: RequestIdentity): string {
  return `/solicitudes/${request.modulo}/${encodeURIComponent(getRequestRouteIdentifier(request))}`;
}

export function normalizeRequestStatus(status: string): string {
  return status.toLowerCase() === "finalizada" ? "completada" : status.toLowerCase();
}
