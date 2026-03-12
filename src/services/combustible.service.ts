// src/services/combustible.service.ts
//
// Alineado 1:1 con:
//   App\Http\Controllers\Api\SolicitudCombustibleController
//   App\Domain\Solicitudes\Enums\EstadoSolicitudEnum
//   routes/api.php  (grupo solicitudes-combustible)
//
// Patrón: funciones exportadas sueltas + instancia `api` de ../lib/axios
// ─────────────────────────────────────────────────────────────────────────────

import { api } from "../lib/axios";
import type {
  LaravelPaginatedResponse,
  RequestFilters,
} from "./requests.service";

// ══════════════════════════════════════════════════════════════════════════════
// ENUMS  (espejo del backend EstadoSolicitudEnum)
// ══════════════════════════════════════════════════════════════════════════════

export type EstadoCombustible =
  | "borrador"
  | "pendiente"
  | "en_revision"
  | "pre_aprobada"
  | "aprobada"
  | "rechazada"
  | "completada"
  | "cancelada";

export type Prioridad = "baja" | "media" | "alta";

export type FormaPago =
  | "vale"
  | "ticket"
  | "tarjeta"
  | "efectivo"
  | "otro";

// ══════════════════════════════════════════════════════════════════════════════
// ENTIDADES  (forma en que el backend serializa las relaciones)
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

/** Solicitud de transporte asociada (referencia mínima) */
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
// SOLICITUD DE COMBUSTIBLE  (shape completo que devuelve el backend)
// ══════════════════════════════════════════════════════════════════════════════

export type SolicitudCombustible = {
  // — Identificación —
  id: number;
  codigo: string;

  // — Relaciones —
  vehiculo_id: number;
  motorista_id?: number | null;
  solicitud_transporte_id?: number | null;
  solicitante_id: number;
  aprobador_id?: number | null;

  // — Datos de la solicitud —
  destino_actividad: string;
  fecha_solicitud: string;                // "YYYY-MM-DD"
  fecha_inicio_periodo?: string | null;
  fecha_fin_periodo?: string | null;
  cantidad_combustible: number;
  prioridad: Prioridad;
  observaciones?: string | null;

  // — Estado —
  estado: EstadoCombustible;

  // — Finalización (llena cuando estado = completada) —
  forma_pago?: FormaPago | null;
  numero_vale_ticket?: string | null;
  valor_total?: number | null;
  comprobantes?: string[] | null;         // rutas storage relativas

  // — Timestamps —
  created_at: string;
  updated_at: string;

  // — Relaciones cargadas (eager load: with([...])) —
  vehiculo?: VehiculoCombustible | null;
  motorista?: MotoristaCombustible | null;
  solicitante?: UsuarioCombustible | null;
  aprobador?: UsuarioCombustible | null;
  solicitudTransporte?: SolicitudTransporteRef | null;
};

// ══════════════════════════════════════════════════════════════════════════════
// CATÁLOGOS  (endpoints /api/catalogos/*)
// ══════════════════════════════════════════════════════════════════════════════

export type VehiculoCatalogo = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  tipo: string;
  label: string; // "{placa} — {marca} {modelo}"
};

export type MotoristaCatalogo = {
  id: number;
  nombre: string;
  dui?: string | null;
};

// ══════════════════════════════════════════════════════════════════════════════
// PAYLOADS  (lo que el frontend envía al backend)
// ══════════════════════════════════════════════════════════════════════════════

/** POST /api/solicitudes-combustible */
export type CrearSolicitudCombustiblePayload = {
  vehiculo_id: number;
  destino_actividad: string;
  fecha_solicitud: string;
  cantidad_combustible: number;
  prioridad: Prioridad;
  // opcionales
  motorista_id?: number;
  solicitud_transporte_id?: number;
  fecha_inicio_periodo?: string;
  fecha_fin_periodo?: string;
  observaciones?: string;
};

/** POST /api/solicitudes-combustible/{id}/aprobar */
export type AprobarSolicitudPayload = {
  observaciones: string;
};

/** POST /api/solicitudes-combustible/{id}/rechazar */
export type RechazarSolicitudPayload = {
  motivo: string;
};

/** POST /api/solicitudes-combustible/{id}/observacion */
export type ObservacionSolicitudPayload = {
  comentario: string;
};

/**
 * POST /api/solicitudes-combustible/{id}/finalizar
 * Se envía como multipart/form-data porque incluye archivos.
 */
export type FinalizarSolicitudPayload = {
  forma_pago: FormaPago;
  valor_total: number;
  comprobantes: File[];           // mínimo 1, máx 5 MB c/u, jpg|jpeg|png|pdf
  numero_vale_ticket?: string;
};

// ══════════════════════════════════════════════════════════════════════════════
// FILTROS  (query params para GET /api/solicitudes-combustible)
// ══════════════════════════════════════════════════════════════════════════════

export type CombustibleFilters = Pick<
  RequestFilters,
  "page" | "per_page"
> & {
  estado?: EstadoCombustible;
  search?: string;
};

// ══════════════════════════════════════════════════════════════════════════════
// TIPO PAGINADO
// ══════════════════════════════════════════════════════════════════════════════

type PaginatedSolicitudesCombustible = Omit<LaravelPaginatedResponse, "data"> & {
  data: SolicitudCombustible[];
};

/** Respuesta normalizada que devuelven todas las funciones de listado */
export type CombustibleListResult = {
  data: SolicitudCombustible[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPER INTERNO
// ══════════════════════════════════════════════════════════════════════════════

/** Construye los query-params descartando valores falsy */
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

/** Normaliza la respuesta paginada de Laravel al shape que usa el frontend */
function normalizePaginated(raw: PaginatedSolicitudesCombustible): CombustibleListResult {
  return {
    data:        raw.data,
    total:       raw.total,
    page:        raw.current_page,
    per_page:    raw.per_page,
    total_pages: raw.last_page,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CATÁLOGOS ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/catalogos/vehiculos
 * Devuelve vehículos activos para poblar el selector del formulario.
 */
export async function getVehiculos(): Promise<VehiculoCatalogo[]> {
  const { data } = await api.get<VehiculoCatalogo[]>("/api/catalogos/vehiculos");
  return data;
}

/**
 * GET /api/catalogos/motoristas
 * Devuelve motoristas activos para poblar el selector del formulario.
 */
export async function getMotoristas(): Promise<MotoristaCatalogo[]> {
  const { data } = await api.get<MotoristaCatalogo[]>("/api/catalogos/motoristas");
  return data;
}

/**
 * GET /api/solicitudes-transporte?per_page=100
 * Filtra solo las que tienen estado aprobada o programada,
 * ya que son las únicas que se pueden asociar a una solicitud de combustible.
 */
export async function getSolicitudesTransporteAsociables(): Promise<SolicitudTransporteRef[]> {
  const { data } = await api.get<PaginatedSolicitudesCombustible | SolicitudTransporteRef[]>(
    "/api/solicitudes-transporte?per_page=100"
  );

  // El endpoint puede devolver paginado o array directo
  const rows: SolicitudTransporteRef[] = Array.isArray(data)
    ? data
    : (data as PaginatedSolicitudesCombustible).data as unknown as SolicitudTransporteRef[];

  return rows.filter((s) =>
    ["aprobada", "programada"].includes(s.estado?.toLowerCase?.() ?? "")
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ── CRUD ──────────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/solicitudes-combustible
 * Lista paginada. Si el usuario no es jefe/admin/ti, el backend filtra
 * automáticamente solo sus propias solicitudes.
 */
export async function getSolicitudesCombustible(
  filters?: CombustibleFilters
): Promise<CombustibleListResult> {
  const qs = buildParams({
    estado:   filters?.estado,
    search:   filters?.search,
    page:     filters?.page,
    per_page: filters?.per_page ?? 10,
  });

  const { data } = await api.get<PaginatedSolicitudesCombustible>(
    `/api/solicitudes-combustible${qs}`
  );

  return normalizePaginated(data);
}

/**
 * GET /api/solicitudes-combustible/:id
 * Detalle con todas las relaciones cargadas:
 * vehiculo.marca, vehiculo.modelo, motorista, solicitante, aprobador, solicitudTransporte
 */
export async function getSolicitudCombustible(
  id: number
): Promise<SolicitudCombustible> {
  const { data } = await api.get<SolicitudCombustible>(
    `/api/solicitudes-combustible/${id}`
  );
  return data;
}

/**
 * POST /api/solicitudes-combustible
 * Crea la solicitud Y la envía automáticamente al flujo de aprobación
 * (el controller llama a service->crear() + service->enviarSolicitud() en secuencia).
 */
export async function crearSolicitudCombustible(
  payload: CrearSolicitudCombustiblePayload
): Promise<SolicitudCombustible> {
  const { data } = await api.post<SolicitudCombustible>(
    "/api/solicitudes-combustible",
    payload
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ACCIONES DEL SOLICITANTE ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/solicitudes-combustible/:id/enviar
 * Mueve la solicitud de borrador → pendiente.
 * Solo puede ejecutarlo el propio solicitante.
 */
export async function enviarSolicitud(
  id: number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/enviar`
  );
  return data;
}

/**
 * POST /api/solicitudes-combustible/:id/finalizar
 * Completa la solicitud aprobada subiendo los comprobantes de pago.
 * Se envía como multipart/form-data.
 *
 * Restricciones del backend:
 *   - forma_pago:         required, in: vale|ticket|tarjeta|efectivo|otro
 *   - valor_total:        required, numeric, min:0
 *   - comprobantes:       required, array, min:1
 *   - comprobantes.*:     file, mimes:jpg,jpeg,png,pdf, max:5120 KB
 *   - numero_vale_ticket: nullable, string
 */
export async function finalizarSolicitud(
  id: number,
  payload: FinalizarSolicitudPayload
): Promise<{ message: string; data: SolicitudCombustible }> {
  const form = new FormData();
  form.append("forma_pago",  payload.forma_pago);
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

/**
 * POST /api/solicitudes-combustible/:id/cancelar
 * Cancela la solicitud. Solo puede ejecutarlo el propio solicitante.
 * (Ruta comentada en api.php — descomentar cuando esté habilitada)
 */
export async function cancelarSolicitud(
  id: number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/cancelar`
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── ACCIONES DE JEFATURA (roles: jefe | admin | ti) ───────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/solicitudes-combustible/:id/observacion
 * Registra una observación sin cambiar el estado principal.
 * Requiere rol: jefe | admin | ti
 */
export async function registrarObservacion(
  id: number,
  payload: ObservacionSolicitudPayload
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/observacion`,
    payload
  );
  return data;
}

/**
 * POST /api/solicitudes-combustible/:id/pre-aprobar
 * Mueve la solicitud a estado pre_aprobada.
 * Requiere rol: jefe | admin | ti
 */
export async function preAprobarSolicitud(
  id: number
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/pre-aprobar`
  );
  return data;
}

/**
 * POST /api/solicitudes-combustible/:id/aprobar
 * Aprueba la solicitud. Requiere observaciones obligatorias.
 * Requiere rol: jefe | admin | ti
 */
export async function aprobarSolicitud(
  id: number,
  payload: AprobarSolicitudPayload
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/aprobar`,
    payload
  );
  return data;
}

/**
 * POST /api/solicitudes-combustible/:id/rechazar
 * Rechaza la solicitud. Requiere motivo obligatorio.
 * Requiere rol: jefe | admin | ti
 */
export async function rechazarSolicitud(
  id: number,
  payload: RechazarSolicitudPayload
): Promise<{ message: string; data: SolicitudCombustible }> {
  const { data } = await api.post<{ message: string; data: SolicitudCombustible }>(
    `/api/solicitudes-combustible/${id}/rechazar`,
    payload
  );
  return data;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── UTILIDADES PARA EL FRONTEND ───────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Retorna la etiqueta visual y el color Tailwind para cada estado.
 * Úsalo en badges, filtros y tablas.
 */
export const ESTADO_CONFIG: Record<
  EstadoCombustible,
  { label: string; badge: string; dot: string }
> = {
  borrador:     { label: "Borrador",      dot: "bg-slate-400",   badge: "bg-slate-50  text-slate-600  ring-slate-200"   },
  pendiente:    { label: "Pendiente",     dot: "bg-amber-400",   badge: "bg-amber-50  text-amber-700  ring-amber-200"   },
  en_revision:  { label: "En revisión",   dot: "bg-blue-400",    badge: "bg-blue-50   text-blue-700   ring-blue-200"    },
  pre_aprobada: { label: "Pre-aprobada",  dot: "bg-violet-400",  badge: "bg-violet-50 text-violet-700 ring-violet-200"  },
  aprobada:     { label: "Aprobada",      dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  rechazada:    { label: "Rechazada",     dot: "bg-red-400",     badge: "bg-red-50    text-red-700    ring-red-200"     },
  completada:   { label: "Completada",    dot: "bg-teal-400",    badge: "bg-teal-50   text-teal-700   ring-teal-200"    },
  cancelada:    { label: "Cancelada",     dot: "bg-slate-300",   badge: "bg-slate-50  text-slate-400  ring-slate-200"   },
};

export const PRIORIDAD_CONFIG: Record<
  Prioridad,
  { label: string; dot: string; badge: string }
> = {
  baja:  { label: "Baja",  dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  media: { label: "Media", dot: "bg-amber-400",   badge: "bg-amber-50   text-amber-700   ring-amber-200"   },
  alta:  { label: "Alta",  dot: "bg-red-400",     badge: "bg-red-50     text-red-700     ring-red-200"     },
};

export const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  vale:     "Vale",
  ticket:   "Ticket",
  tarjeta:  "Tarjeta",
  efectivo: "Efectivo",
  otro:     "Otro",
};

/**
 * Los estados en los que el solicitante aún puede actuar.
 * Útil para mostrar/ocultar botones de acción en el listado.
 */
export const ESTADOS_ACCIONABLES_SOLICITANTE: EstadoCombustible[] = [
  "borrador",
  "aprobada", // puede finalizar
];

/**
 * Estados que permiten a jefatura tomar acción.
 */
export const ESTADOS_ACCIONABLES_JEFATURA: EstadoCombustible[] = [
  "pendiente",
  "en_revision",
  "pre_aprobada",
];

/**
 * Determina si una solicitud puede ser finalizada por el solicitante.
 */
export function puedeFinalizarSolicitud(solicitud: SolicitudCombustible): boolean {
  return solicitud.estado === "aprobada";
}

/**
 * Determina si una solicitud puede ser cancelada por el solicitante.
 */
export function puedeCancelarSolicitud(solicitud: SolicitudCombustible): boolean {
  return ["borrador", "pendiente"].includes(solicitud.estado);
}

/**
 * Construye la URL pública de un comprobante guardado en storage.
 * Requiere que VITE_API_URL apunte al dominio del backend.
 */
export function getComprobantUrl(ruta: string): string {
  const base =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8000";
  return `${base}/storage/${ruta}`;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── COMPATIBILIDAD CON useCombinedRequests / NotificationContext ──────────────
//
// El hook useCombinedRequests y NotificationContext esperan un shape
// normalizado con campos: origen, destino, fecha_salida, unidad.
// Esta función adapta la respuesta real del backend a ese contrato
// sin tener que modificar los archivos que ya consumen este shape.
// ══════════════════════════════════════════════════════════════════════════════

/** Shape normalizado que espera useCombinedRequests */
export type SolicitudCombustibleNormalizada = SolicitudCombustible & {
  modulo: "combustible";
  origen: string;      // mapeado desde solicitante?.name
  destino: string;     // mapeado desde destino_actividad
  fecha_salida: string; // mapeado desde fecha_solicitud
  unidad: undefined;   // combustible no tiene unidad_solicitante
};

/**
 * GET /api/solicitudes-combustible (versión normalizada)
 *
 * Misma firma que el servicio viejo de combustible para mantener
 * compatibilidad con useCombinedRequests y NotificationContext.
 * Mapea los campos reales del backend al shape unificado del hook.
 */
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
      modulo:      "combustible" as const,
      // origen: quién lo solicitó (nombre del solicitante o código)
      origen:      s.solicitante?.name ?? s.codigo,
      // destino: a dónde va / qué actividad
      destino:     s.destino_actividad,
      // fecha_salida: fecha de la solicitud (campo más cercano semánticamente)
      fecha_salida: s.fecha_inicio_periodo ?? s.fecha_solicitud,
      // combustible no tiene unidad_solicitante
      unidad:      undefined,
    })),
  };
}