import { api } from "../lib/api";

export interface Disponibilidad {
  activo: boolean;         // true = disponible, false = incapacitado
  motivo: string | null;
  desde: string | null;   // fecha_inicio ISO
}

/**
 * Obtiene el estado actual del motorista autenticado.
 * GET /api/motorista/mi-estado
 */
export async function getDisponibilidad(): Promise<Disponibilidad> {
  const { data } = await api.get("/api/motorista/mi-estado");
  return data as Disponibilidad;
}

/**
 * Cambia el estado de disponibilidad del motorista autenticado.
 * POST /api/motorista/mi-estado
 * Body: { activo: boolean, motivo?: string }
 */
export async function reportarDisponibilidad(
  activo: boolean,
  motivo: string
): Promise<void> {
  await api.post("/api/motorista/mi-estado", { activo, motivo });
}
