// src/services/combustible.service.ts
//
// Alineado 1:1 con:
//   App\Http\Controllers\Api\SolicitudCombustibleController
//   App\Domain\Solicitudes\Enums\EstadoSolicitudEnum
//   routes/api.php  (grupo solicitudes-combustible)
//
// ─────────────────────────────────────────────────────────────────────────────

import { api, getStorageUrl } from "../lib/api";
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
  | "cancelada"
  | "liquidada";

export type FormaPago =
  | "carga"
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

type PaginatedResponse<T> = Omit<LaravelPaginatedResponse, "data"> & {
  data: T[];
};

type PaginatedSolicitudesCombustible = PaginatedResponse<SolicitudCombustible>;

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

export async function getVehiculos(signal?: AbortSignal): Promise<VehiculoCatalogo[]> {
  const { data } = await api.get<VehiculoCatalogo[]>("/api/catalogos/vehiculos", { signal });
  return data;
}

export async function getMotoristas(signal?: AbortSignal): Promise<MotoristaCatalogo[]> {
  const { data } = await api.get<MotoristaCatalogo[]>("/api/catalogos/motoristas", { signal });
  return data;
}

export async function getSolicitudesTransporteAsociables(signal?: AbortSignal): Promise<SolicitudTransporteRef[]> {
  const { data } = await api.get<PaginatedResponse<SolicitudTransporteRef> | SolicitudTransporteRef[]>(
    "/api/solicitudes-transporte?per_page=100", { signal }
  );
  const rows: SolicitudTransporteRef[] = Array.isArray(data)
    ? data
    : data.data;

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

export async function getSolicitudCombustible(id: string | number): Promise<SolicitudCombustible> {
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
  id: string | number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/enviar`
  );
  return data;
}

export async function finalizarSolicitud(
  id: string | number,
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
  id: string | number
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

export { ESTADO_CONFIG, FORMA_PAGO_LABELS, ESTADOS_ACCIONABLES_SOLICITANTE } from "../constants/combustible.constants";

/** El solicitante puede finalizar cuando el estado es "aprobada" */
export function puedeFinalizarSolicitud(solicitud: SolicitudCombustible): boolean {
  return solicitud.estado === "aprobada";
}

export function puedeCancelarSolicitud(solicitud: SolicitudCombustible): boolean {
  return ["borrador", "pendiente"].includes(solicitud.estado);
}

export function getComprobantUrl(ruta: string): string {
  return getStorageUrl(ruta);
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