import { describe, it, expect } from 'vitest';
import { extractArrayData, extractStatusString, mapToRecentRequest } from '../apiMapper';

describe('extractArrayData', () => {
  it('retorna el array si ya es un array', () => {
    expect(extractArrayData([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('extrae .data si es un objeto con .data array', () => {
    expect(extractArrayData({ data: ['a', 'b'] })).toEqual(['a', 'b']);
  });

  it('retorna [] si es null', () => {
    expect(extractArrayData(null)).toEqual([]);
  });

  it('retorna [] si es undefined', () => {
    expect(extractArrayData(undefined)).toEqual([]);
  });

  it('retorna [] si es un objeto sin .data', () => {
    expect(extractArrayData({ foo: 'bar' })).toEqual([]);
  });

  it('retorna [] si .data no es array', () => {
    expect(extractArrayData({ data: 'not-array' })).toEqual([]);
  });

  it('retorna [] si es un string', () => {
    expect(extractArrayData('hello')).toEqual([]);
  });

  it('retorna [] si es un número', () => {
    expect(extractArrayData(42)).toEqual([]);
  });
});

describe('extractStatusString', () => {
  it('retorna string lowercase si es string', () => {
    expect(extractStatusString('APROBADA')).toBe('aprobada');
  });

  it('normaliza espacios', () => {
    expect(extractStatusString('  Pre_Aprobada  ')).toBe('pre_aprobada');
  });

  it('retorna .value si es objeto con .value', () => {
    expect(extractStatusString({ value: 'Rechazada' })).toBe('rechazada');
  });

  it('retorna .nombre si es objeto sin .value', () => {
    expect(extractStatusString({ nombre: 'Programada' })).toBe('programada');
  });

  it('retorna .status si es objeto sin .value ni .nombre', () => {
    expect(extractStatusString({ status: 'En_Ejecucion' })).toBe('en_ejecucion');
  });

  it('retorna "" si .value no es string', () => {
    expect(extractStatusString({ value: 123 })).toBe('');
  });

  it('retorna "" si es null', () => {
    expect(extractStatusString(null)).toBe('');
  });

  it('retorna "" si es undefined', () => {
    expect(extractStatusString(undefined)).toBe('');
  });

  it('retorna "" si es un número', () => {
    expect(extractStatusString(42)).toBe('');
  });

  it('retorna "" si es un string vacío', () => {
    expect(extractStatusString('')).toBe('');
  });
});

describe('mapToRecentRequest', () => {
  it('mapea un registro válido con código y fecha', () => {
    const result = mapToRecentRequest({
      id: 1,
      codigo: 'TR-001',
      created_at: '2026-01-15T10:00:00Z',
      estado: 'aprobada',
      modulo: 'transporte',
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe('TR-001');
    expect(result!.id).toBe('1');
    expect(result!.status).toBe('aprobada');
    expect(result!.type).toBe('Transporte');
  });

  it('retorna null si no es un objeto', () => {
    expect(mapToRecentRequest(null)).toBeNull();
    expect(mapToRecentRequest('string')).toBeNull();
    expect(mapToRecentRequest(42)).toBeNull();
  });

  it('retorna null si no tiene código', () => {
    expect(mapToRecentRequest({ id: 1, estado: 'aprobada' })).toBeNull();
  });

  it('retorna null si código no es string ni number', () => {
    expect(mapToRecentRequest({ codigo: true })).toBeNull();
  });

  it('usa .code como fallback si .codigo no existe', () => {
    const result = mapToRecentRequest({
      id: 2,
      code: 'CM-002',
      estado: 'pre_aprobada',
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe('CM-002');
  });

  it('usa .date si .created_at no existe', () => {
    const result = mapToRecentRequest({
      id: 3,
      codigo: 'MT-003',
      date: '2026-02-01',
      estado: 'pendiente',
    });

    expect(result).not.toBeNull();
    expect(result!.rawDate).toBe('2026-02-01');
  });

  it('retorna código como string incluso si es number', () => {
    const result = mapToRecentRequest({
      id: 4,
      codigo: 12345,
      estado: 'aprobada',
    });

    expect(result).not.toBeNull();
    expect(result!.code).toBe('12345');
  });

  it('usa tipo por defecto "Transporte" si no hay módulo ni tipo', () => {
    const result = mapToRecentRequest({
      id: 5,
      codigo: 'TR-005',
      estado: 'aprobada',
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe('Transporte');
  });

  it('capitaliza el módulo', () => {
    const result = mapToRecentRequest({
      id: 6,
      codigo: 'CM-006',
      modulo: 'combustible',
      estado: 'aprobada',
    });

    expect(result!.type).toBe('Combustible');
  });

  it('retorna date vacío si created_at es fecha inválida', () => {
    const result = mapToRecentRequest({
      id: 7,
      codigo: 'TR-007',
      created_at: 'not-a-date',
      estado: 'aprobada',
    });

    expect(result).not.toBeNull();
    expect(result!.date).toBe('not-a-date');
  });

  it('retorna id vacío si id no es válido', () => {
    const result = mapToRecentRequest({
      codigo: 'TR-008',
      estado: 'aprobada',
    });

    expect(result).not.toBeNull();
    expect(result!.id).toBe('');
  });

  it('mapea tipo_vehiculo_nombre como Transporte', () => {
    const result = mapToRecentRequest({
      id: 9,
      codigo: 'TR-009',
      tipo_vehiculo_nombre: 'Bus',
      estado: 'aprobada',
    });

    expect(result!.type).toBe('Transporte');
  });

  it('mapea .type directamente si no hay modulo ni tipo_vehiculo_nombre', () => {
    const result = mapToRecentRequest({
      id: 10,
      codigo: 'XX-010',
      type: 'Mantenimiento',
      estado: 'aprobada',
    });

    expect(result!.type).toBe('Mantenimiento');
  });
});
