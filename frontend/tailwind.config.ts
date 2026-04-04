import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#080808',
          secondary: '#101010',
          card:      '#0E0E0E',
          elevated:  '#161616',
        },
        accent: {
          orange: '#FF6B00',
          red:    '#FF3D00',
        },
        text: {
          primary: '#F0F0F0',
          muted:   '#666666',
          dim:     '#444444',
        },
        border: {
          DEFAULT: '#1E1E1E',
          light:   '#2A2A2A',
        },
        chakra: {
          blue:  '#0080FF',
          light: '#40A0FF',
          glow:  'rgba(0, 128, 255, 0.25)',
        },
        power: {
          red:  '#CC0000',
          dark: '#990000',
          glow: 'rgba(204, 0, 0, 0.25)',
        },
        sage: {
          gold:   '#FFD700',
          bright: '#FFEB3B',
          glow:   'rgba(255, 215, 0, 0.25)',
        },
        nature: {
          green: '#00AA44',
          glow:  'rgba(0, 170, 68, 0.25)',
        },
        genjutsu: {
          purple: '#9400D3',
          glow:   'rgba(148, 0, 211, 0.25)',
        },
      },
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        inter:  ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'orange-sm':  '0 0 12px rgba(255, 107, 0, 0.3)',
        'orange-md':  '0 0 24px rgba(255, 107, 0, 0.4)',
        'orange-lg':  '0 0 48px rgba(255, 107, 0, 0.35)',
        'blue-sm':    '0 0 12px rgba(0, 128, 255, 0.3)',
        'blue-md':    '0 0 24px rgba(0, 128, 255, 0.4)',
        'red-sm':     '0 0 12px rgba(204, 0, 0, 0.3)',
        'gold-sm':    '0 0 12px rgba(255, 215, 0, 0.3)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.5)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out',
        'fade-up':     'fadeUp 0.6s ease-out',
        'fade-up-md':  'fadeUp 0.8s ease-out',
        'spin-slow':   'spinSlow 6s linear infinite',
        'spin-fast':   'spinFast 2s linear infinite',
        'float-up':    'floatUp 10s linear infinite',
        'float':       'float 4s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
        'glow-pulse':  'glowPulse 2s ease-in-out infinite',
        'shake':       'shake 0.4s ease-in-out',
        'shimmer':     'shimmer 2s linear infinite',
        'width-in':    'widthIn 0.3s ease-out forwards',
        'pulse-subtle':'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        spinSlow: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        spinFast: {
          '0%':   { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        floatUp: {
          '0%':   { transform: 'translateY(100vh)', opacity: '0.8' },
          '100%': { transform: 'translateY(-20px)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-16px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(255, 107, 0, 0.4)' },
          '50%':      { boxShadow: '0 0 30px rgba(255, 107, 0, 0.7), 0 0 60px rgba(255, 107, 0, 0.2)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-6px)' },
          '40%':      { transform: 'translateX(6px)' },
          '60%':      { transform: 'translateX(-4px)' },
          '80%':      { transform: 'translateX(4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        widthIn: {
          '0%':   { width: '0%' },
          '100%': { width: '100%' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
