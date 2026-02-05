/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4F67E4",
      },
      boxShadow: {
        card: "0 30px 90px rgba(20, 28, 60, 0.18)",
      },
    },
  },
  plugins: [],
};
