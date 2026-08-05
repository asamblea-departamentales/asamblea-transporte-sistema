import { RecentRequest } from '@/features/Aprobacion/api/dashboardApi';
import { normalizeEstado } from '../lib/normalizeEstado';

/** Guard: verifica que el valor sea un objeto plano (no array, no null) */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Extrae de forma segura un array de una respuesta de API inconsistente
 */
export const extractArrayData = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data;
  return [];
};

/**
 * Estandariza el estado de la solicitud, normalizando a minúsculas
 */
/** @deprecated Usar `normalizeEstado` de `@/shared/lib/normalizeEstado` directamente */
export const extractStatusString = normalizeEstado;

/**
 * Mapea un item crudo del backend a la interfaz estricta RecentRequest.
 * Retorna null si el registro es inválido o no tiene código (obligatorio para rutas).
 */
export const mapToRecentRequest = (item: unknown): RecentRequest | null => {
  if (!isRecord(item)) return null;

  // Validar código (OBLIGATORIO para notificaciones y rutas)
  const codeVal = item.codigo ?? item.code ?? null;
  const isValidCode = typeof codeVal === 'string' || typeof codeVal === 'number';

  if (!isValidCode) return null; // Sin código = registro inútil

  // ID como fallback solo para display, no para rutas
  const idVal = item.id ?? null;
  const isValidId = typeof idVal === 'string' || typeof idVal === 'number';

  // Validación de fecha (preserva el string original si la fecha es inválida)
  let parsedDate = '';
  const rawCreatedAt = item.created_at;
  const rawDate = item.date;
  const targetDate = typeof rawCreatedAt === 'string'
    ? rawCreatedAt
    : (typeof rawDate === 'string' ? rawDate : '');

  if (targetDate) {
    const d = new Date(targetDate);
    parsedDate = isNaN(d.getTime()) ? targetDate : d.toLocaleDateString();
  }

  // Tipo de solicitud
  const codeStr = String(codeVal || '').toUpperCase();
  let typeStr = 'Transporte';

  if (typeof item.modulo === 'string' && item.modulo.trim()) {
    typeStr = item.modulo.charAt(0).toUpperCase() + item.modulo.slice(1);
  } else if (typeof item.type === 'string' && item.type.trim()) {
    typeStr = item.type.charAt(0).toUpperCase() + item.type.slice(1);
  } else if (codeStr.startsWith('CB-')) {
    typeStr = 'Combustible';
  } else if (
    codeStr.startsWith('SM-') ||
    codeStr.startsWith('MAN-') ||
    codeStr.startsWith('MANT-') ||
    codeStr.startsWith('MT-')
  ) {
    typeStr = 'Mantenimiento';
  } else if (typeof item.tipo_vehiculo_nombre === 'string') {
    typeStr = 'Transporte';
  }

  return {
    id: isValidId ? String(idVal) : '',
    code: String(codeVal),
    date: parsedDate,
    rawDate: targetDate,
    fechaEjecucion: item.fecha_de_ejecucion ? String(item.fecha_de_ejecucion) : undefined,
    type: typeStr,
    status: extractStatusString(item.estado || item.status)
  };
};
