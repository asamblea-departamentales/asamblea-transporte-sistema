import type { RequestStatus } from "../services/requests.service";

export const ESTADOS: { value: RequestStatus | ""; label: string }[] = [
  { value: "",             label: "Todos"        },
  { value: "pre_aprobada", label: "Pre-Aprobada" },
  { value: "asignada",     label: "Asignada"     },
  { value: "programada",   label: "Programada"   },
  { value: "en_revision",  label: "En Revisión"  },
  { value: "pendiente",    label: "Pendiente"    },
  { value: "aprobada",     label: "Aprobada"     },
  { value: "en_ejecucion", label: "En Ejecución" },
  { value: "completada",   label: "Completada"   },
  { value: "liquidada",    label: "Liquidada"    },
  { value: "rechazada",    label: "Rechazada"    },
  { value: "observada",    label: "Observada"    },
  { value: "borrador",     label: "Borrador"     },
  { value: "cancelada",    label: "Cancelada"    },
];

/** Estados que muestran el bloque de asignación (vehículo + motorista) */
export const ESTADOS_CON_ASIGNACION = [
  "aprobada",
  "en_ejecucion",
  "completada",
  "finalizada",
  "liquidada",
];
export const ALLOWED_FILE_MIME = ["image/jpeg", "image/png", "application/pdf"] as const;
export const ALLOWED_FILE_ACCEPT = ALLOWED_FILE_MIME.join(",");
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;