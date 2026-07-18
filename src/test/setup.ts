/// <reference types="vitest" />
import '@testing-library/jest-dom';

// jsdom's localStorage is broken (--localstorage-file warning).
// Replace it entirely with a Map-backed implementation that both
// tests and production code can use transparently.

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();

  return {
    get length() { return map.size; },
    clear() { map.clear(); },
    getItem(key: string) { return map.get(key) ?? null; },
    setItem(key: string, value: string) { map.set(key, String(value)); },
    removeItem(key: string) { map.delete(key); },
    key(index: number) { return [...map.keys()][index] ?? null; },
  };
}

// Override before each test file loads
Object.defineProperty(window, 'localStorage', {
  value: createMemoryStorage(),
  writable: true,
  configurable: true,
});
