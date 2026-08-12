import { describe, expect, it } from 'vitest';
import { resolveNotificationPath } from '../notification-routing';

describe('resolveNotificationPath', () => {
  it('acepta una URL frontend relativa válida', () => {
    expect(resolveNotificationPath({ url: '/aprobaciones/TR-100' })).toBe('/aprobaciones/TR-100');
  });

  it('acepta una URL absoluta y conserva solo la ruta válida', () => {
    expect(resolveNotificationPath({
      url: 'https://backend.example.com/mantenimiento/aprobaciones/MT-1?source=push'
    })).toBe('/mantenimiento/aprobaciones/MT-1');
  });

  it('convierte URLs antiguas del backend', () => {
    expect(resolveNotificationPath({ url: '/solicitudes-combustible/CB-1' }))
      .toBe('/combustible/aprobaciones/CB-1');
  });

  it('construye la ruta con módulo y código', () => {
    expect(resolveNotificationPath({ module: 'combustible', requestCode: 'CB/01' }))
      .toBe('/combustible/aprobaciones/CB%2F01');
  });

  it('usa el centro como fallback ante datos inválidos o ausentes', () => {
    expect(resolveNotificationPath({ url: 'javascript:alert(1)' })).toBe('/notificaciones');
    expect(resolveNotificationPath({ url: '/ruta-desconocida/1', module: 'otro' })).toBe('/notificaciones');
    expect(resolveNotificationPath({})).toBe('/notificaciones');
  });
});
