/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f8fafc', // slate-50
        surface: '#ffffff',
        primary: '#9333ea', // deep purple
        secondary: '#06b6d4',
        textMain: '#0f172a', // slate-900
        textMuted: '#64748b', // slate-500
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
