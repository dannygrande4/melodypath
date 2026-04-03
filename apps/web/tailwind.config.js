/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Adult / default palette
        primary: {
          50: '#f0f4ff',
          100: '#e0eaff',
          500: '#4f6ef7',
          600: '#3b54e8',
          700: '#2d40c9',
          900: '#1a2580',
        },
        accent: {
          500: '#f59e0b',
          600: '#d97706',
        },
        surface: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          800: '#27272a',
          900: '#18181b',
        },
        // Kids palette
        kids: {
          pink: '#ff6eb4',
          yellow: '#ffd93d',
          green: '#6bcb77',
          blue: '#4d96ff',
          purple: '#c77dff',
        },
        // Note role colors
        note: {
          root: '#4f6ef7',      // blue
          third: '#22c55e',     // green
          fifth: '#f59e0b',     // amber
          seventh: '#a855f7',   // purple
          other: '#64748b',     // slate
        },
        // Timing accuracy colors
        timing: {
          perfect: '#22c55e',
          good: '#f59e0b',
          ok: '#f97316',
          miss: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'note-fall': 'noteFall linear forwards',
        'level-up': 'levelUp 0.6s ease-out forwards',
        'badge-pop': 'badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        noteFall: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        levelUp: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        badgePop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
