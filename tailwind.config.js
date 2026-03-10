/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {

      // ─── COLORES ────────────────────────────────────────────────────────────
      colors: {
        // Colores institucionales
        primary:   "#4F67E4",
        asamblea:  "#2d3a61",

        // ── Surface / Background tokens (dark UI) ──
        surface: {
          base:    "rgba(7,11,22,1)",       // fondo principal del sidebar/header
          overlay: "rgba(7,11,22,0.85)",    // header con backdrop blur
          card:    "rgba(8,12,24,0.97)",    // dropdowns / panels
          subtle:  "rgba(255,255,255,0.04)",// items hover suave
          border:  "rgba(255,255,255,0.06)",// bordes generales
          "border-strong": "rgba(255,255,255,0.08)",
        },

        // ── Blue glass tokens (nav activo, campana, badges) ──
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

        // ── Danger / Logout tokens ──
        danger: {
          glass:        "rgba(239,68,68,0.07)",
          "glass-hover":"rgba(239,68,68,0.15)",
          border:       "rgba(239,68,68,0.15)",
          text:         "#f87171",
        },

        // ── Emerald / Online status ──
        online: {
          bg:     "rgba(16,185,129,0.08)",
          border: "rgba(16,185,129,0.20)",
          dot:    "#10b981",
        },

        // ── Notification type colors ──
        noti: {
          // aprobada
          "approved-dot":    "#10B981",
          "approved-bg":     "rgba(16,185,129,0.15)",
          "approved-border": "rgba(16,185,129,0.30)",
          // rechazada
          "rejected-dot":    "#EF4444",
          "rejected-bg":     "rgba(239,68,68,0.15)",
          "rejected-border": "rgba(239,68,68,0.30)",
          // observada / info
          "info-dot":        "#60A5FA",
          "info-bg":         "rgba(96,165,250,0.15)",
          "info-border":     "rgba(96,165,250,0.30)",
          // finalizada
          "done-dot":        "#94a3b8",
          "done-bg":         "rgba(148,163,184,0.15)",
          "done-border":     "rgba(148,163,184,0.30)",
          // recordatorio
          "reminder-dot":    "#FBBF24",
          "reminder-bg":     "rgba(251,191,36,0.15)",
          "reminder-border": "rgba(251,191,36,0.30)",
        },

        // ── Text tokens ──
        ink: {
          primary:   "#ffffff",
          secondary: "#94a3b8",  // slate-400
          muted:     "#64748b",  // slate-500
          disabled:  "#475569",  // slate-600
          accent:    "#60a5fa",  // blue-400
        },
      },

      // ─── BOX SHADOWS ────────────────────────────────────────────────────────
      boxShadow: {
        card:           "0 30px 90px rgba(20,28,60,0.18)",
        dropdown:       "0 30px 60px rgba(0,0,0,0.5), 0 0 40px rgba(59,130,246,0.07)",
        "dropdown-lg":  "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(59,130,246,0.08)",
        "blue-glow":    "0 0 20px rgba(59,130,246,0.20)",
        "blue-glow-lg": "0 0 24px rgba(59,130,246,0.15)",
        "blue-badge":   "0 0 10px rgba(59,130,246,0.70)",
        "blue-dot":     "0 0 8px #60a5fa",
        "nav-active":   "0 0 20px rgba(59,130,246,0.20)",
        "avatar":       "0 0 18px rgba(59,130,246,0.35)",
        "online-dot":   "0 0 6px #10b981",
        drawer:         "4px 0 40px rgba(0,0,0,0.4), 0 0 60px rgba(59,130,246,0.06)",
      },

      // ─── BORDER RADIUS ──────────────────────────────────────────────────────
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
        // Alias semánticos
        card:    "20px",
        badge:   "20px",
        nav:     "12px",
        avatar:  "50%",
      },

      // ─── BACKDROP BLUR ──────────────────────────────────────────────────────
      backdropBlur: {
        xs:   "8px",
        card: "24px",
        drawer: "32px",
      },

      // ─── FONT FAMILIES ──────────────────────────────────────────────────────
      fontFamily: {
        display: ['"Cormorant Garamond"', "serif"],
        sans:    ['"Plus Jakarta Sans"', "sans-serif"],
      },

      // ─── FONT SIZES (micro typography del sidebar) ──────────────────────────
      fontSize: {
        "2xs": ["9px",  { lineHeight: "1.2" }],
        "3xs": ["8px",  { lineHeight: "1.2" }],
      },

      // ─── LETTER SPACING ─────────────────────────────────────────────────────
      letterSpacing: {
        "ultrawide": "0.3em",
        "megawide":  "0.25em",
      },

      // ─── ANIMACIONES ────────────────────────────────────────────────────────
      animation: {
        // Originales
        "y-rotation":      "rotateY 3s infinite ease-in-out",
        "shimmer":         "shimmer 2s infinite linear",
        "progress-buffer": "progress 2s infinite linear",
        "zoom-fade-out":   "zoomFadeOut 0.6s ease-in-out forwards",
        "fade-out-bg":     "fadeOut 0.6s ease-in-out forwards 0.1s",
        "fade-in":         "fadeIn 0.5s ease-out forwards",
        // Nuevas para Sidebar
        "slide-down":      "slideDown 200ms cubic-bezier(.34,1.56,.64,1) both",
        "slide-in-left":   "slideInLeft 300ms cubic-bezier(.34,1.56,.64,1)",
        "pulse-dot":       "pulseDot 2s cubic-bezier(.4,0,.6,1) infinite",
        "chevron-open":    "chevronOpen 250ms cubic-bezier(.34,1.56,.64,1) forwards",
        "chevron-close":   "chevronClose 250ms cubic-bezier(.34,1.56,.64,1) forwards",
      },

      keyframes: {
        // ── Originales ──
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
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // ── Nuevas para Sidebar ──
        slideDown: {
          from: { opacity: "0", transform: "translateY(-12px) scale(0.97)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideInLeft: {
          from: { transform: "translateX(-100%)" },
          to:   { transform: "translateX(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        chevronOpen: {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(180deg)" },
        },
        chevronClose: {
          from: { transform: "rotate(180deg)" },
          to:   { transform: "rotate(0deg)" },
        },
      },
    },
  },
  plugins: [],
};