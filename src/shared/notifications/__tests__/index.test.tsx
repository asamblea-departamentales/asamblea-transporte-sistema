import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotifications } from '../index';

describe('useNotifications', () => {
  it('lanza error si se usa fuera de NotificationProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useNotifications());
    }).toThrow('useNotifications debe usarse dentro de NotificationProvider');

    consoleSpy.mockRestore();
  });
});
