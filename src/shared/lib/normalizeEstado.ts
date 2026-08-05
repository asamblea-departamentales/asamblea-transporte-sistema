import type { EstadoType } from '@/features/Aprobacion/types';

/**
 * Normalizador centralizado de estados del backend.
 * 
 * El backend puede enviar el estado como:
 * - string: 'aprobada'
 * - objeto: { value: 'aprobada' } | { nombre: '...' } | { status: '...' }
 * - null / undefined
 *
 * Esta función retorna siempre un string en minúsculas y sin espacios extra.
 */
export function normalizeEstado(estado: EstadoType | unknown): string {
  if (!estado) return '';

  if (typeof estado === 'string') {
    return estado.trim().toLowerCase();
  }

  if (typeof estado === 'object' && estado !== null) {
    const obj = estado as Record<string, unknown>;
    const value = obj.value ?? obj.nombre ?? obj.status ?? '';
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
  }

  return '';
}
