import { ComponentType, lazy } from 'react';

type LazyModule<T> = { default: T } | Record<string, unknown>;

export function lazyWithRetry<T extends ComponentType<unknown>>(
  componentImport: () => Promise<LazyModule<T>>
) {
  return lazy(async () => {
    const pageHasBeenRefreshed = JSON.parse(
      window.sessionStorage.getItem('chunk_retry_refreshed') || 'false'
    ) as boolean;

    try {
      const module = await componentImport();
      window.sessionStorage.setItem('chunk_retry_refreshed', 'false');

      if ('default' in module && module.default) {
        return { default: module.default as T };
      }

      const firstExport = Object.values(module).find(
        (value): value is T => typeof value === 'function'
      );

      if (!firstExport) {
        throw new Error('El módulo lazy no contiene un componente exportable.');
      }

      return { default: firstExport };
    } catch (error: unknown) {
      console.warn('[lazyWithRetry] Falló la importación dinámica del módulo:', error);

      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }

      throw error;
    }
  });
}
