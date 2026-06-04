import { api } from "../shared/lib/api";

export interface ViajeAsignado {
  id: number | string;
  fecha: string; // "YYYY-MM-DD"
  hora_salida: string;
  origen: string;
  destino: string;
  estado: string;
  solicitante?: string;
  fecha_salida_real?: string;
  fecha_llegada_destino?: string;
  fecha_inicio_retorno?: string;
}

export async function getViajesMes(mes: string): Promise<ViajeAsignado[]> {
  // mes formato: "YYYY-MM"
  const { data } = await api.get("/api/catalogos/me/viajes", { params: { mes } });
  return data as ViajeAsignado[];
}

export async function iniciarViaje(id: string | number): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/iniciar`);
}

export async function registrarLlegadaViaje(id: string | number): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/llegada`);
}

export async function iniciarRetornoViaje(id: string | number): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/retorno`);
}

export async function finalizarViaje(id: string | number): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/finalizar`);
}
