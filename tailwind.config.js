/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- 1. Mapeo para el Dashboard Principal (Light UI) ---
        bgMain: "#f8fafc",               // Fondo principal del dashboard (slate-50)
        bgSidebar: "rgba(7,11,22,1)",    // Dark
        bgCard: "#ffffff",               // Tarjetas blancas
        borderColor: "#e2e8f0",          // Bordes claros para tarjetas (slate-200)
        textMain: "#0f172a",             // Texto principal oscuro (slate-900)
        textMuted: "#64748b",            // Texto secundario gris (slate-500)

        // --- 2. Colores Institucionales Originales ---
        asamblea: "#2d3a61",
        
        // --- 3. Paleta Premium de Transporte (Dark UI / Glassmorphism) ---
        primary: {
          DEFAULT: "#4F67E4", // Nuevo primary blue
          hover: "#2563eb",
          light: "#eff6ff",
        },
        surface: {
          base:    "rgba(7,11,22,1)",
          overlay: "rgba(7,11,22,0.85)",
          card:    "rgba(8,12,24,0.97)",
          subtle:  "rgba(255,255,255,0.04)",
          border:  "rgba(255,255,255,0.06)",
          "border-strong": "rgba(255,255,255,0.08)",
        },
        blue: {
          glass:        "rgba(59,130,246,0.15)",
          "glass-hover":"rgba(59,130,246,0.20)",
          border:       "rgba(59,130,246,0.30)",
          glow:         "rgba(59,130,246,0.20)",
          badge:        "rgba(59,130,246,0.25)",
          solid:        "#3b82f6",
          light:        "#60a5fa",
          muted:        "rgba(96,165,250,0.15)",
        },
        ink: {
          primary:   "#ffffff",
          secondary: "#94a3b8",
          muted:     "#64748b",
          disabled:  "#475569",
          accent:    "#60a5fa",
        },
        // Old colors kept for compatibility
        purple: { DEFAULT: "#8b5cf6", hover: "#7c3aed", light: "#f5f3ff", border: "#cbd5e1" },
        success: { DEFAULT: "#10b981", light: "#ecfdf5" },
        warning: { DEFAULT: "#f59e0b", light: "#fef9c3", border: "#fef08a" },
        danger: { DEFAULT: "#ef4444", light: "#fef2f2" },
      },
      fontFamily: {
        // Sustituimos ambas por Plus Jakarta Sans para dar ese look premium
        title: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        ultrawide: "0.3em",
        megawide: "0.25em",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        premium: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
        // Transporte shadows
        card: "0 10px 40px rgba(0,0,0,0.1), 0 0 20px rgba(59,130,246,0.05)",
        "blue-glow": "0 0 20px rgba(59,130,246,0.15)",
        "blue-badge": "0 0 10px rgba(59,130,246,0.5)",
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        rotateY: {
          "0%, 100%": { transform: "rotateY(0deg)" },
          "50%":      { transform: "rotateY(12deg)" },
        },
        shimmer: {
          "0%":   { transform: "translateX(-150%) skewX(-20deg)" },
          "100%": { transform: "translateX(150%) skewX(-20deg)" },
        },
        progress: {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        zoomFadeOut: {
          "0%":   { transform: "scale(1)",    opacity: "1" },
          "100%": { transform: "scale(1.15)", opacity: "0" },
        },
        fadeOut: {
          "0%":   { opacity: "1" },
          "100%": { opacity: "0" },
        }
      },
      animation: {
        shake: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        "y-rotation":      "rotateY 3s infinite ease-in-out",
        "shimmer":         "shimmer 2s infinite linear",
        "progress-buffer": "progress 2s infinite linear",
        "zoom-fade-out":   "zoomFadeOut 0.6s ease-in-out forwards",
        "fade-out-bg":     "fadeOut 0.6s ease-in-out forwards 0.1s"
      }
    },
  },
  plugins: [],
}
