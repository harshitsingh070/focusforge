/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#0f766e',
          600: '#0a5f59',
          700: '#094c47',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI', 'sans-serif'],
        display: ['Space Grotesk', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 12px 30px rgba(10, 95, 89, 0.12)',
      },
    },
  },
  plugins: [],
};
