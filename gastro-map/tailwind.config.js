/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: apunta a todos los archivos de la app
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Paleta oficial de Domino's Pizza
      colors: {
        dominos: {
          red: "#E31837",       // Rojo principal Domino's
          blue: "#006491",      // Azul principal Domino's
          darkblue: "#004C6D",  // Azul oscuro para hover/active
          lightblue: "#0080BB", // Azul claro para acentos
          white: "#FFFFFF",
          offwhite: "#F5F5F5",  // Fondo claro
          gray: "#6B7280",      // Texto secundario
          darkgray: "#374151",  // Texto principal
          lightgray: "#E5E7EB", // Bordes/separadores
          black: "#1A1A1A",     // Texto oscuro
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
