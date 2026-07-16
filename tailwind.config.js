/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        asamblea: "#2d3a61",
        bgMain: "#f8fafc",
        bgSidebar: "#0b1528",
        bgCard: "#ffffff",
        borderColor: "#cbd5e1",
        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          light: "#eff6ff",
        },
        purple: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          light: "#f5f3ff",
          border: "#cbd5e1",
        },
        success: {
          DEFAULT: "#10b981",
          light: "#ecfdf5",
        },
        warning: {
          DEFAULT: "#f59e0b",
          light: "#fef9c3",
          border: "#fef08a",
        },
        danger: {
          DEFAULT: "#ef4444",
          light: "#fef2f2",
        },
        textMain: "#1e293b",
        textMuted: "#64748b",
      },
      fontFamily: {
        title: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      letterSpacing: {
        ultrawide: "0.3em",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
        premium: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
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
