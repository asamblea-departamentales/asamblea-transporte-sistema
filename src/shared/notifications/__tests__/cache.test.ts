import { describe, expect, it, beforeEach } from 'vitest';
import {
  clearLegacyCache,
  clearUserCache,
  getCacheKeys,
  isRecord,
  isStringRecord,
  isValidNotification
} from '../cache';

describe('notification cache', () => {
  beforeEach(() => localStorage.clear());

  it('valida la forma normalizada de una notificación', () => {
    expect(isValidNotification({
      id: 'uuid-1',
      title: 'Solicitud pendiente',
      description: 'Revisa la solicitud',
      time: '12 ago 2026, 10:00',
      read: false,
      action_url: '/aprobaciones/TR-001',
      type: 'solicitud_pendiente_aprobacion'
    })).toBe(true);
  });

  it('rechaza una notificación sin tipo o UUID', () => {
    expect(isValidNotification({ id: '', title: 'x', description: 'x', time: 'x', read: false, action_url: '/' })).toBe(false);
    expect(isValidNotification({ id: 'x', title: 'x', description: 'x', time: 'x', read: false, action_url: '/' })).toBe(false);
  });

  it('separa las claves por usuario', () => {
    expect(getCacheKeys(15)).toEqual({
      notifs: 'app_notifications_v2_15',
      dismissed: 'app_dismissed_notifications_v1_15'
    });
    expect(getCacheKeys('a/b').notifs).toBe('app_notifications_v2_a%2Fb');
    expect(getCacheKeys(15).notifs).not.toBe(getCacheKeys(16).notifs);
  });

  it('limpia solo la caché del usuario indicado', () => {
    const first = getCacheKeys(1);
    const second = getCacheKeys(2);
    localStorage.setItem(first.notifs, '[]');
    localStorage.setItem(first.dismissed, '[]');
    localStorage.setItem(second.notifs, '[]');

    clearUserCache(1);

    expect(localStorage.getItem(first.notifs)).toBeNull();
    expect(localStorage.getItem(first.dismissed)).toBeNull();
    expect(localStorage.getItem(second.notifs)).not.toBeNull();
  });

  it('elimina las claves heredadas de la simulación', () => {
    localStorage.setItem('jefatura_notifs_v1', '[]');
    localStorage.setItem('jefatura_snap_v1', '{}');
    localStorage.setItem('notifs_1', '[]');
    localStorage.setItem('snap_1', '{}');

    clearLegacyCache();

    expect(localStorage.getItem('jefatura_notifs_v1')).toBeNull();
    expect(localStorage.getItem('jefatura_snap_v1')).toBeNull();
    expect(localStorage.getItem('notifs_1')).toBeNull();
    expect(localStorage.getItem('snap_1')).toBeNull();
  });

  it('mantiene los guards de objetos y records de texto', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isStringRecord({ a: '1' })).toBe(true);
    expect(isStringRecord({ a: 1 })).toBe(false);
  });
});
