import { api } from "../lib/api";

export interface Disponibilidad {
  activo: boolean;         // true = disponible, false = incapacitado
  motivo: string | null;
  desde: string | null;   // fecha_inicio ISO
}

/**
 * Obtiene el estado actual del motorista autenticado.
 * GET /api/motoristas/me/estado
 */
export async function getDisponibilidad(): Promise<Disponibilidad> {
  const { data } = await api.get("/api/motoristas/me/estado");
  return data as Disponibilidad;
}

/**
 * Cambia el estado de disponibilidad del motorista autenticado.
 * POST /api/motoristas/me/estado
 * Body: { activo: boolean, motivo?: string }
 */
export async function reportarDisponibilidad(
  activo: boolean,
  motivo: string
): Promise<void> {
  await api.post("/api/motoristas/me/estado", { activo, motivo });
}
