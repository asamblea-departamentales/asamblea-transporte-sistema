import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargamos el env manualmente para el proxy local si es necesario, 
  // aunque aquí hardcodearemos el proxy local por defecto para desarrollo.
  const env = loadEnv(mode, process.cwd(), '');
  const targetApi = env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [react()],
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
    esbuild: {
      // Elimina todos los console.log y debugger en producción
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    }
  };
})
