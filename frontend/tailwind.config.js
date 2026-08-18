/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6f2",
          100: "#d7eae1",
          200: "#aed5c5",
          300: "#7db8a3",
          400: "#4d9780",
          500: "#2f7d67",
          600: "#1f6452",
          700: "#175243",
          800: "#124138",
          900: "#0d322b",
          950: "#06211b",
        },
        gold: {
          50: "#fbf7eb",
          100: "#f6eed2",
          200: "#eddda5",
          300: "#e3c674",
          400: "#d9b14b",
          500: "#c9a227",
          600: "#a8842a",
          700: "#86662a",
          800: "#6f5529",
          900: "#5e4827",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "Arial", "sans-serif"],
      },
      boxShadow: {
        premium: "0 12px 40px -12px rgba(13, 50, 43, 0.28)",
        gold: "0 10px 30px -10px rgba(201, 162, 39, 0.5)",
      },
    },
  },
  plugins: [],
}
