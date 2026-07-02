import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Cargamos el env manualmente para el proxy local si es necesario, 
    // aunque aquí hardcodearemos el proxy local por defecto para desarrollo.
    var env = loadEnv(mode, process.cwd(), '');
    var targetApi = env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    return {
        plugins: [
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: ['logo.png', 'favicon.ico', 'apple-touch-icon.png'],
                manifest: {
                    name: 'Asamblea Legislativa - Transporte',
                    short_name: 'AsambleaLogística',
                    description: 'Sistema de Aprobaciones de Transporte y Combustible',
                    theme_color: '#182645',
                    background_color: '#f8fafc',
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
        } : undefined
    };
});
