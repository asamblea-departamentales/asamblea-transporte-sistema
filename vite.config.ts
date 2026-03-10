import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Asamblea Legislativa de El Salvador",
        short_name: "Asamblea",
        description:
          "Sistema institucional de la Asamblea Legislativa de El Salvador",
        theme_color: "#1a1f36",
        background_color: "#f0f2f5",
        display: "standalone",
        start_url: "/",
        orientation: "portrait",
        icons: [
          {
            src: "public/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "public/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "public/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [".trycloudflare.com"],
  },
});