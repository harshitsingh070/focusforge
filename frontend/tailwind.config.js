/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },
        brand: {
          primary: '#7C3AED',
          accent: '#8B5CF6',
          hover: '#6D28D9',
        },
        appbg: {
          light: '#F8F9FC',
          dark: '#0F172A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F8FAFC',
          hover: '#F3F4F6',
          elevated: '#FFFFFF',
          dark: '#111827',
          'dark-soft': '#1F2937',
          'dark-hover': '#374151',
          'dark-elevated': '#111827',
        },
        ink: {
          primary: '#111827',
          secondary: '#6B7280',
          muted: '#9CA3AF',
          'dark-primary': '#F9FAFB',
          'dark-secondary': '#D1D5DB',
          'dark-muted': '#9CA3AF',
        },
        chart: {
          primary: '#8B5CF6',
          secondary: '#3B82F6',
          accent: '#22C55E',
          grid: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
        display: ['Inter', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        e1: '0 1px 2px rgba(0,0,0,0.05)',
        e2: '0 8px 20px rgba(0,0,0,0.08)',
        e3: '0 20px 40px rgba(0,0,0,0.12)',
        hover: '0 0 0 1px rgba(124,58,237,0.30), 0 0 28px rgba(139,92,246,0.25), 0 20px 40px rgba(0,0,0,0.18)',
        glow: '0 0 0 1px rgba(124,58,237,0.30), 0 0 28px rgba(139,92,246,0.25), 0 20px 40px rgba(0,0,0,0.18)',
        'glow-btn': '0 0 0 3px rgba(139,92,246,0.45), 0 0 20px rgba(167,139,250,0.35), 0 8px 24px rgba(0,0,0,0.25)',
        soft: '0 8px 20px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        md: '10px',
        lg: '16px',
        xl: '20px',
        full: '999px',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '180ms',
        slow: '240ms',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(.4,0,.2,1)',
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      width: {
        sidebar: '260px',
      },
      maxWidth: {
        content: '1280px',
      },
    },
  },
  plugins: [],
};
