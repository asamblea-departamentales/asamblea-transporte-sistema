import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    target: "esnext"
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'Transporte Motorista',
        short_name: 'Motorista',
        description: 'Aplicación para motoristas',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
      }
    })
  ],
})
