import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stadium: {
          pitch: '#080B10',
          night: '#0C1017',
          card: '#131924',
          elevated: '#1A2232',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: 'rgba(0, 255, 135, 0.12)',
        },
        volt: {
          DEFAULT: '#00FF87',
          neon: '#00FF87',
          light: '#60FFA8',
          dark: '#059669',
          glow: 'rgba(0, 255, 135, 0.35)',
        },
        floodlight: {
          DEFAULT: '#00E5FF',
          cyan: '#00E5FF',
          sky: '#38BDF8',
          glow: 'rgba(0, 229, 255, 0.35)',
        },
        vip: {
          gold: '#F59E0B',
          amber: '#D97706',
        },
        // Markup uses bare `text-cyan` / `bg-cyan/10`; give cyan a default (floodlight) shade
        cyan: { ...colors.cyan, DEFAULT: '#00E5FF' },
        primary: {
          DEFAULT: '#00FF87',
          light: '#60FFA8',
          dark: '#059669',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#00FF87',
          600: '#10B981',
          700: '#059669',
        },
        surface: {
          background: '#080B10',
          card: '#131924',
          dark: '#080B10',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
        // Used for IDs and numbers; system mono keeps it crisp and consistent
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'card': '20px',
        'ticket': '24px',
      },
      // Soft, layered elevation. Legacy "brutal" names are kept so existing
      // markup keeps working, but they now map to the refined shadows.
      boxShadow: {
        'card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.7)',
        'raised': '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 48px -20px rgba(0,0,0,0.85)',
        'volt': '0 0 0 1px rgba(0,255,135,0.25), 0 10px 30px -12px rgba(0,255,135,0.35)',
        'brutal': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.7)',
        'brutal-sm': '0 6px 16px -10px rgba(0,0,0,0.7)',
        'brutal-lg': '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 48px -20px rgba(0,0,0,0.85)',
        'brutal-volt': '0 0 0 1px rgba(0,255,135,0.25), 0 10px 30px -12px rgba(0,255,135,0.35)',
        'brutal-cyan': '0 0 0 1px rgba(0,229,255,0.25), 0 10px 30px -12px rgba(0,229,255,0.3)',
        'brutal-amber': '0 0 0 1px rgba(245,158,11,0.25), 0 10px 30px -12px rgba(245,158,11,0.3)',
        'brutal-white': '0 0 0 1px rgba(255,255,255,0.15), 0 10px 30px -12px rgba(0,0,0,0.6)',
        'neon-volt': '0 0 24px -6px rgba(0, 255, 135, 0.35)',
        'neon-cyan': '0 0 24px -6px rgba(0, 229, 255, 0.35)',
        'stadium-card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.7)',
        'glow-subtle': '0 6px 16px -10px rgba(0,0,0,0.7)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'radar-sweep': 'radarSweep 6s linear infinite',
      }
    },
  },
  plugins: [],
}
