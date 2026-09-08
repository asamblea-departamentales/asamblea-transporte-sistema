import { normalizeEstado } from '@/shared/lib/normalizeEstado';

export type DocumentoModulo = 'transporte' | 'combustible' | 'mantenimiento';

export type DocumentoTipo =
  | 'transporte-documento-oficial'
  | 'transporte-mision-oficial'
  | 'combustible-documento-oficial'
  | 'mantenimiento-orden-trabajo';

export interface DocumentosVisibilityInput {
  modulo: DocumentoModulo;
  estado: unknown;
  vehiculoPlaca?: string | null;
  motoristaNombre?: string | null;
}

const ESTADOS_DESCARGABLES: Record<DocumentoModulo, readonly string[]> = {
  transporte: ['aprobada', 'programada', 'en_ejecucion', 'completada'],
  combustible: ['aprobada', 'asignada', 'completada'],
  mantenimiento: ['aprobada', 'en_ejecucion', 'completada'],
};

const ROLES_DOCUMENTOS = new Set(['jefe', 'admin', 'ti', 'super_admin']);

const hasValue = (value?: string | null): boolean => Boolean(value?.trim());

export const hasDocumentosAccess = (roles?: readonly unknown[]): boolean => {
  if (!Array.isArray(roles)) return false;

  return roles.some((role) => {
    if (typeof role === 'string') {
      return ROLES_DOCUMENTOS.has(role.trim().toLowerCase());
    }

    if (role && typeof role === 'object') {
      const candidate = role as { name?: unknown; slug?: unknown };
      const roleName = typeof candidate.name === 'string'
        ? candidate.name
        : typeof candidate.slug === 'string'
          ? candidate.slug
          : '';
      return ROLES_DOCUMENTOS.has(roleName.trim().toLowerCase());
    }

    return false;
  });
};

export const isDocumentoDescargable = ({
  modulo,
  estado,
  vehiculoPlaca,
  motoristaNombre,
}: DocumentosVisibilityInput): boolean => {
  const normalizedEstado = normalizeEstado(estado);
  if (!ESTADOS_DESCARGABLES[modulo].includes(normalizedEstado)) return false;

  if (modulo === 'transporte') {
    return hasValue(vehiculoPlaca) && hasValue(motoristaNombre);
  }

  return true;
};

export const getDocumentosDisponibles = ({ modulo, ...input }: DocumentosVisibilityInput): DocumentoTipo[] => {
  if (!isDocumentoDescargable({ modulo, ...input })) return [];

  if (modulo === 'transporte') {
    return ['transporte-documento-oficial', 'transporte-mision-oficial'];
  }

  if (modulo === 'combustible') {
    return ['combustible-documento-oficial'];
  }

  return ['mantenimiento-orden-trabajo'];
};

export const getDocumentoLabel = (tipo: DocumentoTipo): string => {
  switch (tipo) {
    case 'transporte-documento-oficial':
      return 'Documento de Autorización';
    case 'transporte-mision-oficial':
      return 'Misión Oficial';
    case 'combustible-documento-oficial':
      return 'Documento de Autorización';
    case 'mantenimiento-orden-trabajo':
      return 'Orden de Trabajo';
  }
};

