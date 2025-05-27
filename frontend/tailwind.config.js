/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // استبدال اللون الأزرق بلون Cyan Blue
        'primary': '#61dafb',
        'blue': {
          50: '#e6fafe',  // لون Cyan Blue فاتح جداً
          100: '#d0f5fc', // لون Cyan Blue فاتح
          200: '#bff3fc', // لون Cyan Blue فاتح
          300: '#94ecfb', // لون Cyan Blue متوسط الفتح
          400: '#61dafb', // لون Cyan Blue الأساسي
          500: '#3bc9f5', // لون Cyan Blue متوسط
          600: '#21b3ea', // لون Cyan Blue متوسط الغمق
          700: '#1a8fd8', // لون Cyan Blue غامق
          800: '#1a73b6', // لون Cyan Blue غامق جداً
          900: '#0c5a9e', // لون Cyan Blue غامق جداً
        },
        // نسخة من اللون الأزرق القديم للتوافق مع الكود القديم
        'old-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'dark': {
          'bg': '#121212',
          'card': '#1e1e1e',
          'input': '#2a2a2a',
          'border': '#333333',
          'text': '#f5f5f5',
          'text-secondary': '#a0a0a0',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
    },
  },
  plugins: [],
}

