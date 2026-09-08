import { isAxiosError } from 'axios';
import { axiosClient } from '@/shared/api/axiosClient';
import type { DocumentoModulo, DocumentoTipo } from '../types/documentos';

export interface ObtenerDocumentoParams {
  codigo: string;
  modulo: DocumentoModulo;
  tipo: DocumentoTipo;
  combustibleId?: number;
}

export class DocumentoApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'DocumentoApiError';
    this.status = status;
  }
}

const getEndpoint = (codigo: string, modulo: DocumentoModulo, tipo: DocumentoTipo): string => {
  const encodedCodigo = encodeURIComponent(codigo);

  switch (tipo) {
    case 'transporte-documento-oficial':
      return `/solicitudes-transporte/${encodedCodigo}/documento-oficial`;
    case 'transporte-mision-oficial':
      return `/solicitudes-transporte/${encodedCodigo}/mision-oficial`;
    case 'combustible-documento-oficial':
      return `/solicitudes-combustible/${encodedCodigo}/documento-oficial`;
    case 'mantenimiento-orden-trabajo':
      return `/solicitudes-mantenimiento/${encodedCodigo}/orden-trabajo`;
    default:
      return `/${modulo}/${encodedCodigo}`;
  }
};

const getStatusMessage = (status?: number): string => {
  switch (status) {
    case 403:
      return 'No tienes permisos para consultar documentos de jefatura.';
    case 422:
      return 'El estado actual de la solicitud no permite descargar este documento.';
    case 404:
      return 'No se encontró la solicitud o el documento solicitado.';
    case 500:
      return 'El servidor no pudo generar el documento. Intenta nuevamente.';
    default:
      return 'No se pudo obtener el documento.';
  }
};

const readBackendMessage = async (data: unknown): Promise<string | undefined> => {
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as { message?: unknown };
      return typeof parsed.message === 'string' ? parsed.message : data;
    } catch {
      return data;
    }
  }

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      const text = await data.text();
      return readBackendMessage(text);
    } catch {
      return undefined;
    }
  }

  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    return typeof message === 'string' ? message : undefined;
  }

  return undefined;
};

export const documentosApi = {
  obtener: async ({ codigo, modulo, tipo, combustibleId }: ObtenerDocumentoParams): Promise<Blob> => {
    try {
      const response = await axiosClient.get<Blob>(getEndpoint(codigo, modulo, tipo), {
        responseType: 'blob',
        headers: {
          Accept: 'application/pdf',
        },
        ...(tipo === 'transporte-documento-oficial' && combustibleId
          ? { params: { combustible_id: combustibleId } }
          : {}),
      });

      return response.data;
    } catch (error: unknown) {
      if (!isAxiosError(error)) throw error;

      const status = error.response?.status;
      const backendMessage = await readBackendMessage(error.response?.data);
      throw new DocumentoApiError(backendMessage || getStatusMessage(status), status);
    }
  },
};

