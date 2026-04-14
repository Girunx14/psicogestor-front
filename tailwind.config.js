/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B396A',
          50: '#E8EDF4',
          100: '#D1DBE9',
          200: '#A3B7D3',
          300: '#7593BD',
          400: '#476FA7',
          500: '#1B396A',
          600: '#162E55',
          700: '#112340',
          800: '#0B172B',
          900: '#060C16',
        },
        secondary: {
          DEFAULT: '#807E82',
          50: '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D7',
          300: '#C2C1C3',
          400: '#A1A0A2',
          500: '#807E82',
          600: '#666568',
          700: '#4D4C4E',
          800: '#333234',
          900: '#1A191A',
        },
        surface: '#EEF2F8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}