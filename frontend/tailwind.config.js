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
        mono: ['monospace'],
      },
      borderRadius: {
        'card': '20px',
        'ticket': '24px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px #000000',
        'brutal-sm': '2px 2px 0px #000000',
        'brutal-lg': '6px 6px 0px #000000',
        'brutal-volt': '4px 4px 0px #00FF87',
        'brutal-cyan': '4px 4px 0px #00E5FF',
        'brutal-amber': '4px 4px 0px #F59E0B',
        'brutal-white': '4px 4px 0px #FFFFFF',
        'neon-volt': '0 0 35px -5px rgba(0, 255, 135, 0.4)',
        'neon-cyan': '0 0 35px -5px rgba(0, 229, 255, 0.4)',
        'stadium-card': '4px 4px 0px #000000',
        'glow-subtle': '3px 3px 0px #000000',
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
