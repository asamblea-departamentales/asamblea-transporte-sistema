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
  fecha_retorno_real?: string;
}

export async function getViajesMes(mes: string): Promise<ViajeAsignado[]> {
  // mes formato: "YYYY-MM"
  const { data } = await api.get("/api/motoristas/me/viajes", { params: { mes } });
  return data as ViajeAsignado[];
}

export async function getViajeById(id: string | number): Promise<ViajeAsignado> {
  const { data } = await api.get(`/api/motoristas/me/viajes/${id}`);
  return data as ViajeAsignado;
}

export async function iniciarViaje(id: string | number, timestamp_real?: string): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/iniciar`, { timestamp_real });
}

export async function registrarLlegadaViaje(id: string | number, timestamp_real?: string): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/llegada`, { timestamp_real });
}

export async function iniciarRetornoViaje(id: string | number, timestamp_real?: string): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/retorno`, { timestamp_real });
}

export async function finalizarViaje(id: string | number, timestamp_real?: string): Promise<void> {
  await api.post(`/api/motoristas/me/viajes/${id}/finalizar`, { timestamp_real });
}
