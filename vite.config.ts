/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargamos el env manualmente para el proxy local si es necesario, 
  // aunque aquí hardcodearemos el proxy local por defecto para desarrollo.
  const env = loadEnv(mode, process.cwd(), '');
  const targetApi = env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'autoUpdate',
        includeAssets: ['logo.png', 'favicon.ico', 'apple-touch-icon.png'],
        manifest: {
          name: 'Asamblea Legislativa - Transporte',
          short_name: 'AsambleaLogística',
          gcm_sender_id: '103953800507',
          description: 'Sistema de Aprobaciones de Transporte y Combustible',
          theme_color: '#1a1f36',
          background_color: '#1a1f36',
          display: 'standalone',
          icons: [
            {
              src: 'logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: targetApi,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      sourcemap: false, // Desactiva la generación de source maps (oculta el código en producción)
    },
    esbuild: mode === 'production' ? {
      drop: ['console', 'debugger']
    } : undefined,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.codebase-memory'],
      environmentOptions: {
        jsdom: {
          url: 'http://localhost:3000',
          pretendToBeVisual: true,
        },
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
      },
    },
  };
})