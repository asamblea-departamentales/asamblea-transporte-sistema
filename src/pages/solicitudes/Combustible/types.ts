import type {
  VehiculoCatalogo,
  MotoristaCatalogo,
  SolicitudTransporteRef,
} from "../../../services/combustible.service";

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS LOCALES
// ══════════════════════════════════════════════════════════════════════════════

export interface CatalogosState {
  vehiculos: VehiculoCatalogo[];
  motoristas: MotoristaCatalogo[];
  solicitudesTransporte: SolicitudTransporteRef[];
  loading: boolean;
  loadingSolicitudes: boolean;
  error: string | null;
}

export interface FormData {
  solicitud_transporte_id: string;
  vehiculo_id: string;
  motorista_id: string;
  destino_actividad: string;
  fecha_solicitud: string;
  fecha_inicio_periodo: string;
  fecha_fin_periodo: string;
  cantidad_combustible: string;
  observaciones: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ══════════════════════════════════════════════════════════════════════════════

export const INITIAL: FormData = {
  solicitud_transporte_id: "",
  vehiculo_id: "",
  motorista_id: "",
  destino_actividad: "",
  fecha_solicitud: new Date().toISOString().split("T")[0],
  fecha_inicio_periodo: "",
  fecha_fin_periodo: "",
  cantidad_combustible: "",
  observaciones: "",
};

export const STEPS = [
  { id: 1, title: "Vehículo",  subtitle: "Selección del activo"    },
  { id: 2, title: "Detalles",  subtitle: "Información de la carga" },
  { id: 3, title: "Revisión",  subtitle: "Confirmar y enviar"      },
];

export const estadoTransporteColor: Record<string, string> = {
  aprobada:   "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  programada: "bg-blue-50 text-blue-700 ring-blue-200/70",
};

// ══════════════════════════════════════════════════════════════════════════════
// VALIDACIÓN
// ══════════════════════════════════════════════════════════════════════════════

export function validate(step: number, data: FormData): Partial<Record<keyof FormData, string>> {
  const e: Partial<Record<keyof FormData, string>> = {};

  if (step === 1) {
    if (!data.vehiculo_id) e.vehiculo_id = "Seleccione un vehículo.";
  }

  if (step === 2) {
    if (!data.destino_actividad.trim())
      e.destino_actividad = "El destino o actividad es requerido.";
    if (!data.fecha_solicitud)
      e.fecha_solicitud = "La fecha de solicitud es requerida.";
    if (!data.cantidad_combustible || isNaN(Number(data.cantidad_combustible)) || Number(data.cantidad_combustible) <= 0)
      e.cantidad_combustible = "Ingrese una cantidad válida mayor a 0.";
    if (data.fecha_inicio_periodo && data.fecha_fin_periodo && data.fecha_fin_periodo < data.fecha_inicio_periodo)
      e.fecha_fin_periodo = "Debe ser posterior a la fecha de inicio.";
  }

  return e;
}
