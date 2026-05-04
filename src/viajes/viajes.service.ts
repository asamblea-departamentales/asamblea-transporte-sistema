import { api } from "../shared/lib/api";

export interface ViajeAsignado {
  id: number | string;
  fecha: string; // "YYYY-MM-DD"
  hora_salida: string;
  origen: string;
  destino: string;
  estado: string;
  solicitante?: string;
}

export async function getViajesMes(mes: string): Promise<ViajeAsignado[]> {
  // mes formato: "YYYY-MM"
  const { data } = await api.get("/api/catalogos/me/viajes", { params: { mes } });
  return data as ViajeAsignado[];
}
