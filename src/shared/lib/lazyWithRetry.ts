import { lazy, ComponentType } from 'react';

/**
 * Wrapper de `lazy` que detecta cuando falla la carga de un módulo JS (chunk desactualizado
 * tras un nuevo deploy en Vercel/CDN) y recarga la página automáticamente para obtener el nuevo bundle.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T } | { [key: string]: any }>
) {
  return lazy(async () => {
    const pageHasBeenRefreshed = JSON.parse(
      window.sessionStorage.getItem('chunk_retry_refreshed') || 'false'
    );

    try {
      const module = await componentImport();
      window.sessionStorage.setItem('chunk_retry_refreshed', 'false');
      // Soporte para exportaciones nombradas o por defecto
      if ('default' in module) {
        return { default: module.default };
      }
      const firstExport = Object.values(module)[0] as T;
      return { default: firstExport };
    } catch (error: any) {
      console.warn('[lazyWithRetry] Fallo la importación dinámica del módulo:', error);

      if (!pageHasBeenRefreshed) {
        window.sessionStorage.setItem('chunk_retry_refreshed', 'true');
        window.location.reload();
        return new Promise<{ default: T }>(() => {}); // Pausar mientras recarga
      }

      throw error;
    }
  });
}
