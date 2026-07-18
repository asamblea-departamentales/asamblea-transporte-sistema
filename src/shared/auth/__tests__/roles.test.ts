import { describe, it, expect } from 'vitest';
import { hasJefaturaAccess } from '../roles';

describe('hasJefaturaAccess', () => {
  it('retorna true para roles válidos en minúsculas', () => {
    expect(hasJefaturaAccess(['jefe'])).toBe(true);
    expect(hasJefaturaAccess(['admin'])).toBe(true);
    expect(hasJefaturaAccess(['administrador'])).toBe(true);
    expect(hasJefaturaAccess(['super_admin'])).toBe(true);
    expect(hasJefaturaAccess(['ti'])).toBe(true);
  });

  it('retorna true para roles en mayúsculas (case-insensitive)', () => {
    expect(hasJefaturaAccess(['JEFE'])).toBe(true);
    expect(hasJefaturaAccess(['ADMIN'])).toBe(true);
    expect(hasJefaturaAccess(['TI'])).toBe(true);
  });

  it('retorna true con espacios extra (trim)', () => {
    expect(hasJefaturaAccess([' jefe '])).toBe(true);
    expect(hasJefaturaAccess(['  admin  '])).toBe(true);
  });

  it('retorna true con múltiples roles (alguno válido)', () => {
    expect(hasJefaturaAccess(['operativo', 'jefe'])).toBe(true);
    expect(hasJefaturaAccess(['user', 'admin', 'guest'])).toBe(true);
  });

  it('retorna false para roles no autorizados', () => {
    expect(hasJefaturaAccess(['operativo'])).toBe(false);
    expect(hasJefaturaAccess(['user'])).toBe(false);
    expect(hasJefaturaAccess(['guest'])).toBe(false);
  });

  it('retorna false para undefined', () => {
    expect(hasJefaturaAccess(undefined)).toBe(false);
  });

  it('retorna false para array vacío', () => {
    expect(hasJefaturaAccess([])).toBe(false);
  });

  it('retorna false para valores no string', () => {
    expect(hasJefaturaAccess([null])).toBe(false);
    expect(hasJefaturaAccess([123])).toBe(false);
    expect(hasJefaturaAccess([true])).toBe(false);
    expect(hasJefaturaAccess([{}, { value: 'jefe' }])).toBe(false);
  });

  it('retorna false para string en lugar de array', () => {
    expect(hasJefaturaAccess('jefe' as unknown as readonly unknown[])).toBe(false);
  });

  it('retorna false para null', () => {
    expect(hasJefaturaAccess(null as unknown as readonly unknown[])).toBe(false);
  });
});
