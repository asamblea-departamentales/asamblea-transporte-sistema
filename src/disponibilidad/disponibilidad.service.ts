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
  const payload = data?.data && typeof data.data === 'object' ? data.data : data;
  
  // Normalizar el valor de activo (puede venir como true, 1, "1", false, 0, "0", o dentro de disponible/activo)
  const rawActivo = payload?.activo ?? payload?.disponible;
  const isActivo = rawActivo === undefined || rawActivo === null 
    ? true 
    : (rawActivo === true || rawActivo === 1 || rawActivo === "1" || rawActivo === "true");

  localStorage.setItem("motorista_activo", String(isActivo));

  return {
    activo: isActivo,
    motivo: payload?.motivo ?? null,
    desde: payload?.desde ?? payload?.fecha_inicio ?? null,
  };
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
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`📁 Campo [${key}]: ARCHIVO ADJUNTO -> nombre: "${value.name}", tamaño: ${value.size} bytes, tipo: ${value.type}`);
    } else {
      console.log(`📝 Campo [${key}]: DATO RAW -> "${value}"`);
    }
  }
  console.log("------------------------------------------");

  await api.post("/api/motoristas/me/estado", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  localStorage.setItem("motorista_activo", String(activo));
}
