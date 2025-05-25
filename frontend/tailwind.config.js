/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Incluye todos los archivos de React
  ],
  theme: {
    extend: {
      fontFamily: {
        persero: ['"Passero One"', 'cursive'], // Define la fuente personalizada
      },
    },
  },
  plugins: [],
};

