/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest", srcDir: "src", filename: "service-worker.ts", registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Asamblea Legislativa de El Salvador", short_name: "Asamblea",
        description: "Sistema institucional de la Asamblea Legislativa de El Salvador",
        theme_color: "#1a1f36", background_color: "#f0f2f5", display: "standalone",
        start_url: "/", orientation: "portrait",
        icons: [
          { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        ],
      },
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"] },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    globals: true, environment: "jsdom", setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8", reporter: ["text", "html"],
      include: [
        "src/lib/appError.ts", "src/lib/format.ts", "src/lib/geo.ts", "src/lib/storage.ts",
        "src/lib/requestIdentity.ts",
        "src/pages/transport/useTransportDraft.ts",
      ],
      thresholds: { lines: 70, functions: 70, branches: 60, statements: 70 },
    },
  },
  server: {
    allowedHosts: [".trycloudflare.com", ".transporte.test"],
    proxy: {
      "/nominatim": { target: "https://nominatim.openstreetmap.org", changeOrigin: true, rewrite: (url) => url.replace(/^\/nominatim/, "") },
      "/osrm": { target: "https://router.project-osrm.org", changeOrigin: true, rewrite: (url) => url.replace(/^\/osrm/, "") },
    },
  },
});
