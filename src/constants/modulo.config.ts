import type { ReactNode } from "react";
import type { Modulo } from "../hooks/useCombinedRequests";

type ModuloConfig = {
  label: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  icon: ReactNode;
};

export const MODULO_CONFIG: Record<Modulo, ModuloConfig> = {
  transporte: {
    label: "Transporte",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200/70",
    dotClass: "bg-blue-500",
    borderClass: "border-l-blue-500",
    icon: null,
  },
  mantenimiento: {
    label: "Mantenimiento",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
    icon: null,
  },
  combustible: {
    label: "Combustible",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
    dotClass: "bg-amber-500",
    borderClass: "border-l-amber-500",
    icon: null,
  },
};

export const BG_DOT: Record<string, string> = {
  pendiente: "bg-amber-400",
  aprobada: "bg-emerald-500",
  en_ejecucion: "bg-indigo-500",
  completada: "bg-slate-400",
  finalizada: "bg-slate-400",
  rechazada: "bg-red-400",
  observada: "bg-blue-400",
  borrador: "bg-gray-300",
};

export function getDotColor(estado: string): string {
  return BG_DOT[estado.toLowerCase()] ?? "bg-gray-300";
}

export function formatFechaLinda(fecha: string): string {
  const d = new Date(fecha);
  const dia = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dia} • ${hora}`;
}

export function canUserCancel(estado: string): boolean {
  return estado.toLowerCase() === "pendiente";
}
