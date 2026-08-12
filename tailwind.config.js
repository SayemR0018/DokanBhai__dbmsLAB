/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#0f9d58',
          600: '#0c8049',
          700: '#0a6338',
          800: '#074528',
          900: '#052a18',
        },
        steel: {
          50:  '#f5f7fa',
          100: '#e6ebf2',
          200: '#cbd5e1',
          300: '#94a3b8',
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'system-ui', 'sans-serif'],
        bn: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-low': 'pulseLow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseLow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
