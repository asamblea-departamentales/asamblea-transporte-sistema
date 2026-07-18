import { describe, it, expect, beforeEach } from 'vitest';
import {
  isRecord,
  isStringRecord,
  isValidNotification,
  getCacheKeys,
  generateId,
  clearUserCache,
  clearLegacyCache
} from '../cache';

describe('isRecord', () => {
  it('acepta objetos planos', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
  });

  it('rechaza null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('rechaza arrays', () => {
    expect(isRecord([])).toBe(false);
    expect(isRecord([1, 2, 3])).toBe(false);
  });

  it('rechaza primitivos', () => {
    expect(isRecord(42)).toBe(false);
    expect(isRecord('string')).toBe(false);
    expect(isRecord(true)).toBe(false);
  });
});

describe('isStringRecord', () => {
  it('acepta Record<string, string>', () => {
    expect(isStringRecord({ a: '1', b: '2' })).toBe(true);
    expect(isStringRecord({})).toBe(true);
  });

  it('rechaza objetos con valores no string', () => {
    expect(isStringRecord({ a: 1, b: '2' })).toBe(false);
    expect(isStringRecord({ a: null })).toBe(false);
    expect(isStringRecord({ a: undefined })).toBe(false);
    expect(isStringRecord({ a: true })).toBe(false);
  });

  it('rechaza arrays', () => {
    expect(isStringRecord([1, 2, 3])).toBe(false);
  });

  it('rechaza null', () => {
    expect(isStringRecord(null)).toBe(false);
  });
});

describe('isValidNotification', () => {
  it('acepta notificación válida', () => {
    const valid = {
      id: 1,
      title: 'Test',
      description: 'Description',
      time: 'Justo ahora',
      read: false,
      action_url: '/aprobaciones/TR-001'
    };
    expect(isValidNotification(valid)).toBe(true);
  });

  it('acepta id como string', () => {
    const valid = {
      id: 'abc-123',
      title: 'Test',
      description: 'Description',
      time: 'Justo ahora',
      read: true,
      action_url: '/aprobaciones/TR-001'
    };
    expect(isValidNotification(valid)).toBe(true);
  });

  it('rechaza si falta title', () => {
    const invalid = {
      id: 1,
      description: 'Description',
      time: 'Justo ahora',
      read: false,
      action_url: '/aprobaciones/TR-001'
    };
    expect(isValidNotification(invalid)).toBe(false);
  });

  it('rechaza si falta read', () => {
    const invalid = {
      id: 1,
      title: 'Test',
      description: 'Description',
      time: 'Justo ahora',
      action_url: '/aprobaciones/TR-001'
    };
    expect(isValidNotification(invalid)).toBe(false);
  });

  it('rechaza si falta action_url', () => {
    const invalid = {
      id: 1,
      title: 'Test',
      description: 'Description',
      time: 'Justo ahora',
      read: false
    };
    expect(isValidNotification(invalid)).toBe(false);
  });

  it('rechaza null', () => {
    expect(isValidNotification(null)).toBe(false);
  });

  it('rechaza primitivos', () => {
    expect(isValidNotification('string')).toBe(false);
    expect(isValidNotification(42)).toBe(false);
  });
});

describe('getCacheKeys', () => {
  it('genera claves para userId numérico', () => {
    const keys = getCacheKeys(1);
    expect(keys.notifs).toBe('notifs_1');
    expect(keys.snapshot).toBe('snap_1');
  });

  it('genera claves para userId string', () => {
    const keys = getCacheKeys('abc');
    expect(keys.notifs).toBe('notifs_abc');
    expect(keys.snapshot).toBe('snap_abc');
  });

  it('codifica caracteres especiales', () => {
    const keys = getCacheKeys('a/b');
    expect(keys.notifs).toBe('notifs_a%2Fb');
  });

  it('genera claves diferentes por usuario', () => {
    const keys1 = getCacheKeys(1);
    const keys2 = getCacheKeys(2);
    expect(keys1.notifs).not.toBe(keys2.notifs);
  });
});

describe('generateId', () => {
  it('genera IDs únicos', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('genera strings no vacíos', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

describe('clearUserCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('elimina claves del usuario específico', () => {
    localStorage.setItem('notifs_1', '[]');
    localStorage.setItem('snap_1', '{}');
    localStorage.setItem('notifs_2', '[]');

    clearUserCache(1);

    expect(localStorage.getItem('notifs_1')).toBeNull();
    expect(localStorage.getItem('snap_1')).toBeNull();
    expect(localStorage.getItem('notifs_2')).not.toBeNull();
  });
});

describe('clearLegacyCache', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('elimina jefatura_notifs_v1 y jefatura_snap_v1', () => {
    localStorage.setItem('jefatura_notifs_v1', '[]');
    localStorage.setItem('jefatura_snap_v1', '{}');
    localStorage.setItem('notifs_1', '[]');

    clearLegacyCache();

    expect(localStorage.getItem('jefatura_notifs_v1')).toBeNull();
    expect(localStorage.getItem('jefatura_snap_v1')).toBeNull();
    expect(localStorage.getItem('notifs_1')).not.toBeNull();
  });
});
