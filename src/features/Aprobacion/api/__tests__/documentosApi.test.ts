import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axiosClient } from '@/shared/api/axiosClient';
import { documentosApi } from '../documentosApi';
import { getDocumentosDisponibles } from '../../types/documentos';

vi.mock('@/shared/api/axiosClient', () => ({
  axiosClient: {
    get: vi.fn(),
  },
}));

describe('documentosApi', () => {
  const get = vi.mocked(axiosClient.get);

  beforeEach(() => vi.clearAllMocks());

  it('consulta el documento de transporte como PDF usando el código y combustible_id', async () => {
    const pdf = new Blob(['pdf'], { type: 'application/pdf' });
    get.mockResolvedValue({ data: pdf });

    await expect(documentosApi.obtener({
      codigo: 'SOL/2026/0001',
      modulo: 'transporte',
      tipo: 'transporte-documento-oficial',
      combustibleId: 42,
    })).resolves.toBe(pdf);

    expect(get).toHaveBeenCalledWith(
      '/solicitudes-transporte/SOL%2F2026%2F0001/documento-oficial',
      expect.objectContaining({
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
        params: { combustible_id: 42 },
      })
    );
  });

  it('no agrega combustible_id a la misión oficial', async () => {
    get.mockResolvedValue({ data: new Blob(['pdf'], { type: 'application/pdf' }) });

    await documentosApi.obtener({
      codigo: 'SOL-2026-0001',
      modulo: 'transporte',
      tipo: 'transporte-mision-oficial',
      combustibleId: 42,
    });

    expect(get.mock.calls[0][1]).not.toHaveProperty('params');
  });
});

describe('visibilidad de documentos', () => {
  it('usa estados distintos para combustible y transporte', () => {
    expect(getDocumentosDisponibles({
      modulo: 'combustible',
      estado: 'asignada',
    })).toEqual(['combustible-documento-oficial']);

    expect(getDocumentosDisponibles({
      modulo: 'transporte',
      estado: 'asignada',
      vehiculoPlaca: 'P-123',
      motoristaNombre: 'Motorista',
    })).toEqual([]);
  });

  it('exige vehículo y motorista finales para transporte', () => {
    expect(getDocumentosDisponibles({
      modulo: 'transporte',
      estado: 'completada',
      vehiculoPlaca: 'P-123',
    })).toEqual([]);

    expect(getDocumentosDisponibles({
      modulo: 'transporte',
      estado: 'completada',
      vehiculoPlaca: 'P-123',
      motoristaNombre: 'Motorista',
    })).toHaveLength(2);
  });
});

