/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        industrial: {
          50: '#f4f6f7',
          100: '#e3e8ea',
          200: '#c7d1d6',
          300: '#a1b0b8',
          400: '#748792',
          500: '#586b76',
          600: '#485762',
          700: '#3d4951',
          800: '#363f46',
          900: '#30373d',
          950: '#1c2126',
        },
        accent: {
          50: '#eefcf3',
          100: '#d6f7e1',
          200: '#b1edc9',
          300: '#7edcab',
          400: '#47c489',
          500: '#22a86e',
          600: '#158759',
          700: '#136c49',
          800: '#13563c',
          900: '#114833',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
