// src/services/combustible.service.ts
//
// Alineado 1:1 con:
//   App\Http\Controllers\Api\SolicitudCombustibleController
//   App\Domain\Solicitudes\Enums\EstadoSolicitudEnum
//   routes/api.php  (grupo solicitudes-combustible)
//
// ─────────────────────────────────────────────────────────────────────────────

import { api, BASE_URL } from "../lib/api";
import type {
  LaravelPaginatedResponse,
  RequestFilters,
} from "./requests.service";

// ══════════════════════════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════════════════════════

export type EstadoCombustible =
  | "borrador"
  | "pendiente"
  | "en_revision"
  | "pre_aprobada"
  | "aprobada"
  | "asignada"
  | "rechazada"
  | "completada"
  | "cancelada";

export type FormaPago =
  | "vale"
  | "ticket"
  | "tarjeta"
  | "efectivo"
  | "otro";

// ══════════════════════════════════════════════════════════════════════════════
// ENTIDADES
// ══════════════════════════════════════════════════════════════════════════════

export type MarcaVehiculo = { id: number; nombre: string };
export type ModeloVehiculo = { id: number; nombre: string };

export type VehiculoCombustible = {
  id: number;
  placa: string;
  marca?: MarcaVehiculo | null;
  modelo?: ModeloVehiculo | null;
  tipo?: { id: number; nombre: string } | null;
};

export type MotoristaCombustible = {
  id: number;
  nombre: string;
  dui?: string | null;
};

export type UsuarioCombustible = {
  id: number;
  name: string;
  email: string;
};

export type SolicitudTransporteRef = {
  id: number;
  codigo: string;
  estado: string;
  destino: string;
  motivo_actividad?: string | null;
  fecha_salida: string;
  fecha_retorno?: string | null;
  vehiculo?: { id: number; placa: string; marca?: MarcaVehiculo | null; modelo?: ModeloVehiculo | null } | null;
  motorista?: { id: number; nombre: string } | null;
};

// ══════════════════════════════════════════════════════════════════════════════
// SOLICITUD DE COMBUSTIBLE
// ══════════════════════════════════════════════════════════════════════════════

export type SolicitudCombustible = {
  // Identificación
  id: number;
  codigo: string;

  // Relaciones FK
  vehiculo_id: number;
  motorista_id?: number | null;
  solicitud_transporte_id?: number | null;
  solicitante_id: number;
  aprobador_id?: number | null;
  asignado_por?: number | null;
  contrato_id?: number | null;
  serie_vale_id?: number | null;

  // Datos de la solicitud
  destino_actividad: string;
  fecha_solicitud: string;
  fecha_inicio_periodo?: string | null;
  fecha_fin_periodo?: string | null;
  cantidad_combustible: number;
  observaciones?: string | null;

  // Asignación de vales
  cantidad_vales?: number | null;
  correlativo_inicio?: number | null;
  correlativo_fin?: number | null;
  monto_asignado?: string | null;
  valor_unitario?: string | null;
  valor_unitario_vale?: string | null;

  // Estado
  estado: EstadoCombustible;
  fecha_aprobacion?: string | null;
  fecha_asignacion?: string | null;
  motivo_rechazo?: string | null;

  // Finalización
  forma_pago?: FormaPago | null;
  numero_vale_ticket?: string | null;
  valor_total?: number | null;
  comprobantes?: string[] | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  // Relaciones eager-loaded
  vehiculo?: VehiculoCombustible | null;
  motorista?: MotoristaCombustible | null;
  solicitante?: UsuarioCombustible | null;
  aprobador?: UsuarioCombustible | null;
  solicitudTransporte?: SolicitudTransporteRef | null;
};

// ══════════════════════════════════════════════════════════════════════════════
// CATÁLOGOS
// ══════════════════════════════════════════════════════════════════════════════

export type VehiculoCatalogo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo: string;
  label: string;
  motorista_id?: number;
  motorista_nombre?: string;
  motorista_dui?: string | null;
  motorista?: MotoristaCatalogo;
};

export type MotoristaCatalogo = {
  id: number;
  nombre: string;
  dui?: string | null;
};

// ══════════════════════════════════════════════════════════════════════════════
// PAYLOADS
// ══════════════════════════════════════════════════════════════════════════════

export type CrearSolicitudCombustiblePayload = {
  vehiculo_id: number;
  destino_actividad: string;
  fecha_solicitud: string;
  cantidad_combustible: number;
  motorista_id?: number;
  solicitud_transporte_id?: number;
  fecha_inicio_periodo?: string;
  fecha_fin_periodo?: string;
  observaciones?: string;
};

export type AprobarSolicitudPayload = { observaciones: string };
export type RechazarSolicitudPayload = { motivo: string };
export type ObservacionSolicitudPayload = { comentario: string };

export type FinalizarSolicitudPayload = {
  forma_pago: FormaPago;
  valor_total: number;
  comprobantes: File[];
  numero_vale_ticket?: string;
};

// ══════════════════════════════════════════════════════════════════════════════
// FILTROS Y PAGINACIÓN
// ══════════════════════════════════════════════════════════════════════════════

export type CombustibleFilters = Pick<RequestFilters, "page" | "per_page"> & {
  estado?: EstadoCombustible;
  search?: string;
};

type PaginatedSolicitudesCombustible = Omit<LaravelPaginatedResponse, "data"> & {
  data: SolicitudCombustible[];
};

export type CombustibleListResult = {
  data: SolicitudCombustible[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS INTERNOS
// ══════════════════════════════════════════════════════════════════════════════

function buildParams(filters: Record<string, string | number | undefined | null>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function normalizePaginated(raw: PaginatedSolicitudesCombustible): CombustibleListResult {
  return {
    data: raw.data,
    total: raw.total,
    page: raw.current_page,
    per_page: raw.per_page,
    total_pages: raw.last_page,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// CATÁLOGOS
// ══════════════════════════════════════════════════════════════════════════════

export async function getVehiculos(): Promise<VehiculoCatalogo[]> {
  const { data } = await api.get<VehiculoCatalogo[]>("/api/catalogos/vehiculos");
  return data;
}

export async function getMotoristas(): Promise<MotoristaCatalogo[]> {
  const { data } = await api.get<MotoristaCatalogo[]>("/api/catalogos/motoristas");
  return data;
}

export async function getSolicitudesTransporteAsociables(): Promise<SolicitudTransporteRef[]> {
  const { data } = await api.get<PaginatedSolicitudesCombustible | SolicitudTransporteRef[]>(
    "/api/solicitudes-transporte?per_page=100"
  );
  const rows: SolicitudTransporteRef[] = Array.isArray(data)
    ? data
    : (data as PaginatedSolicitudesCombustible).data as unknown as SolicitudTransporteRef[];

  return rows.filter((s) =>
    ["aprobada", "programada"].includes(s.estado?.toLowerCase?.() ?? "")
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CRUD
// ══════════════════════════════════════════════════════════════════════════════

export async function getSolicitudesCombustible(
  filters?: CombustibleFilters
): Promise<CombustibleListResult> {
  const qs = buildParams({
    estado: filters?.estado,
    search: filters?.search,
    page: filters?.page,
    per_page: filters?.per_page ?? 10,
  });
  const { data } = await api.get<PaginatedSolicitudesCombustible>(
    `/api/solicitudes-combustible${qs}`
  );
  return normalizePaginated(data);
}

export async function getSolicitudCombustible(id: number): Promise<SolicitudCombustible> {
  const { data } = await api.get<SolicitudCombustible>(`/api/solicitudes-combustible/${id}`);
  return data;
}

export async function crearSolicitudCombustible(
  payload: CrearSolicitudCombustiblePayload
): Promise<SolicitudCombustible> {
  const { data } = await api.post<SolicitudCombustible>("/api/solicitudes-combustible", payload);
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACCIONES DEL SOLICITANTE
// ══════════════════════════════════════════════════════════════════════════════

export async function enviarSolicitud(
  id: number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/enviar`
  );
  return data;
}

export async function finalizarSolicitud(
  id: number,
  payload: FinalizarSolicitudPayload
): Promise<{ message: string; data: SolicitudCombustible }> {
  const form = new FormData();
  form.append("forma_pago", payload.forma_pago);
  form.append("valor_total", String(payload.valor_total));

  if (payload.numero_vale_ticket) {
    form.append("numero_vale_ticket", payload.numero_vale_ticket);
  }

  payload.comprobantes.forEach((file) => {
    form.append("comprobantes[]", file);
  });

  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/finalizar`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function cancelarSolicitud(
  id: number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/cancelar`
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// ACCIONES DE JEFATURA (REMOVIDAS DEL FRONTEND)
// ══════════════════════════════════════════════════════════════════════════════


// ══════════════════════════════════════════════════════════════════════════════
// UTILIDADES PARA EL FRONTEND
// ══════════════════════════════════════════════════════════════════════════════

export const ESTADO_CONFIG: Record<
  EstadoCombustible,
  { label: string; badge: string; dot: string }
> = {
  borrador: { label: "Borrador", dot: "bg-slate-400", badge: "bg-slate-50   text-slate-600   ring-slate-200" },
  pendiente: { label: "Pendiente", dot: "bg-amber-400", badge: "bg-amber-50   text-amber-700   ring-amber-200" },
  en_revision: { label: "En revisión", dot: "bg-blue-400", badge: "bg-blue-50    text-blue-700    ring-blue-200" },
  pre_aprobada: { label: "Pre-aprobada", dot: "bg-violet-400", badge: "bg-violet-50  text-violet-700  ring-violet-200" },
  aprobada: { label: "Aprobada", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  asignada: { label: "Asignada", dot: "bg-cyan-400", badge: "bg-cyan-50    text-cyan-700    ring-cyan-200" }, // ✅ nuevo
  rechazada: { label: "Rechazada", dot: "bg-red-400", badge: "bg-red-50     text-red-700     ring-red-200" },
  completada: { label: "Completada", dot: "bg-teal-400", badge: "bg-teal-50    text-teal-700    ring-teal-200" },
  cancelada: { label: "Cancelada", dot: "bg-slate-300", badge: "bg-slate-50   text-slate-400   ring-slate-200" },
};

export const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  vale: "Vale",
  ticket: "Ticket",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
  otro: "Otro",
};

export const ESTADOS_ACCIONABLES_SOLICITANTE: EstadoCombustible[] = [
  "borrador",
  "asignada", // ✅ puede finalizar cuando está asignada
];

/** El solicitante puede finalizar cuando el estado es "asignada" */
export function puedeFinalizarSolicitud(solicitud: SolicitudCombustible): boolean {
  return solicitud.estado === "asignada";
}

export function puedeCancelarSolicitud(solicitud: SolicitudCombustible): boolean {
  return ["borrador", "pendiente"].includes(solicitud.estado);
}

export function getComprobantUrl(ruta: string): string {
  return `${BASE_URL}/storage/${ruta}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPATIBILIDAD CON useCombinedRequests / NotificationContext
// ══════════════════════════════════════════════════════════════════════════════

export type SolicitudCombustibleNormalizada = SolicitudCombustible & {
  modulo: "combustible";
  origen: string;
  destino: string;
  fecha_salida: string;
  unidad: undefined;
};

export async function getAllCombustibles(
  filters?: CombustibleFilters
): Promise<{
  data: SolicitudCombustibleNormalizada[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}> {
  const result = await getSolicitudesCombustible(filters);
  return {
    ...result,
    data: result.data.map((s) => ({
      ...s,
      modulo: "combustible" as const,
      origen: s.solicitante?.name ?? s.codigo,
      destino: s.destino_actividad,
      fecha_salida: s.fecha_inicio_periodo ?? s.fecha_solicitud,
      unidad: undefined,
    })),
  };
}