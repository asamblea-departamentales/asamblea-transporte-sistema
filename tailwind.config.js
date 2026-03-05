/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F67E4",
        asamblea: "#2d3a61", // Color institucional opcional
      },
      boxShadow: {
        card: "0 30px 90px rgba(20, 28, 60, 0.18)",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      // --- NUEVAS ANIMACIONES ---
      animation: {
        'y-rotation': 'rotateY 3s infinite ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'progress-buffer': 'progress 2s infinite linear',
        'zoom-fade-out': 'zoomFadeOut 0.6s ease-in-out forwards',
        'fade-out-bg': 'fadeOut 0.6s ease-in-out forwards 0.1s',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        rotateY: {
          '0%, 100%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(12deg)' }, // Giro suave institucional
        },
        shimmer: {
          '0%': { transform: 'translateX(-150%) skewX(-20deg)' },
          '100%': { transform: 'translateX(150%) skewX(-20deg)' },
        },
        progress: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        zoomFadeOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};