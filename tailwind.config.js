/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f1',
          100: '#dcf2df',
          200: '#bce4c3',
          300: '#8fce9c',
          400: '#5bb16e',
          500: '#38954c',
          600: '#29773b',
          700: '#235f31',
          800: '#1b5e20', // Forest Green
          900: '#174123',
          950: '#0b2413',
        },
        fresh: {
          50: '#f2fbf4',
          100: '#e1f7e6',
          200: '#c5eed0',
          300: '#97deaa',
          400: '#4caf50', // Fresh Green
          500: '#43a047',
          600: '#388e3c',
          700: '#2e7d32',
          800: '#28632a',
          900: '#225224',
        },
        surface: '#F7FAF7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
