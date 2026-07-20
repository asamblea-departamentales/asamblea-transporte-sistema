import type { EstadoCombustible, FormaPago } from "../services/combustible.service";

export const ESTADO_CONFIG: Record<
  EstadoCombustible,
  { label: string; badge: string; dot: string }
> = {
  borrador:      { label: "Borrador",     dot: "bg-slate-400",   badge: "bg-slate-50   text-slate-600   ring-slate-200" },
  pendiente:     { label: "Pendiente",    dot: "bg-amber-400",   badge: "bg-amber-50   text-amber-700   ring-amber-200" },
  en_revision:   { label: "En revisión",  dot: "bg-blue-400",    badge: "bg-blue-50    text-blue-700    ring-blue-200" },
  pre_aprobada:  { label: "Pre-aprobada", dot: "bg-violet-400",  badge: "bg-violet-50  text-violet-700  ring-violet-200" },
  aprobada:      { label: "Aprobada",     dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  asignada:      { label: "Asignada",     dot: "bg-cyan-400",    badge: "bg-cyan-50    text-cyan-700    ring-cyan-200" },
  rechazada:     { label: "Rechazada",    dot: "bg-red-400",     badge: "bg-red-50     text-red-700     ring-red-200" },
  completada:    { label: "Completada",   dot: "bg-teal-400",    badge: "bg-teal-50    text-teal-700    ring-teal-200" },
  cancelada:     { label: "Cancelada",    dot: "bg-slate-300",   badge: "bg-slate-50   text-slate-400   ring-slate-200" },
  liquidada:     { label: "Liquidada",    dot: "bg-indigo-400", badge: "bg-indigo-50 text-indigo-700 ring-indigo-200" },
};

export const FORMA_PAGO_LABELS: Record<FormaPago, string> = {
  carga:    "Carga",
  ticket:   "Ticket",
  tarjeta:  "Tarjeta",
  efectivo: "Efectivo",
  otro:     "Otro",
};

export const ESTADOS_ACCIONABLES_SOLICITANTE: EstadoCombustible[] = [
  "borrador",
  "aprobada",
];
