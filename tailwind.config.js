/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f5f3ff', 100: '#ede9fe', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 900: '#4c1d95' },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.15)',
        'card': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -10px rgba(0, 0, 0, 0.15)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}