// ─── Estilos por estado ───────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pendiente:    "bg-amber-100 text-amber-700 border-amber-200",
  aprobada:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  asignada:     "bg-cyan-100 text-cyan-700 border-cyan-200",
  en_ejecucion: "bg-purple-100 text-purple-700 border-purple-200",
  completada:   "bg-slate-800 text-white border-slate-600",
  finalizada:   "bg-slate-800 text-white border-slate-600",
  rechazada:    "bg-red-100 text-red-700 border-red-200",
  observada:    "bg-blue-100 text-blue-700 border-blue-200",
  borrador:     "bg-gray-100 text-gray-600 border-gray-200",
};

export function getStatusStyle(status: string): string {
  return STATUS_STYLES[status.toLowerCase()] ?? "bg-gray-100 text-gray-600 border-gray-200";
}

export function isCompleted(status: string): boolean {
  return ["completada", "finalizada"].includes(status.toLowerCase());
}

// ─── Formateadores de fecha ───────────────────────────────────────────────────

/** "15 mar 2025, 08:30" */
export function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** "2025-03-15 08:30" */
export function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toISOString().slice(0, 16).replace("T", " ");
}