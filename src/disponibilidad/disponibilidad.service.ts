import { api } from "../shared/lib/api";

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

export async function reportarDisponibilidad(
  activo: boolean,
  motivo?: string,
  evidencia?: File
): Promise<void> {
  const formData = new FormData();
  // Laravel suele esperar booleanos como '1' o '0' en FormData, o 'true'/'false'
  formData.append("activo", activo ? "1" : "0");
  
  if (motivo) {
    formData.append("motivo", motivo);
  }
  
  if (!activo && evidencia) {
    formData.append("archivo", evidencia);
  }

  // 🔥 LOG PARA DEPURACIÓN: Verificador en consola de lo que se enviará
  console.log("📡 [FRONTEND] -> [BACKEND] ENVIANDO DISPONIBILIDAD:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`📁 Campo [${key}]: ARCHIVO ADJUNTO -> nombre: "${value.name}", tamaño: ${value.size} bytes, tipo: ${value.type}`);
    } else {
      console.log(`📝 Campo [${key}]: DATO RAW -> "${value}"`);
    }
  }
  console.log("------------------------------------------");

  // Dejamos que Axios y el navegador resuelvan el Content-Type y el boundary automáticamente
  await api.post("/api/motoristas/me/estado", formData, {
    headers: {
      "Content-Type": undefined
    }
  });
}
