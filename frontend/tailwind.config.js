/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        t: {
          void:    '#080808',
          deep:    '#0e0e0e',
          panel:   '#141414',
          border:  '#262626',
          border2: '#333333',
          amber:   '#FF8C00',
          'amber-bright': '#FFB347',
          'amber-dim':    '#7A4200',
          green:   '#00D46A',
          red:     '#FF3333',
          yellow:  '#FFD700',
          white:   '#F0E6D3',
          dim:     '#666666',
          muted:   '#444444',
        },
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'pulse-amber': 'pulseAmber 2s ease-in-out infinite',
        'scanline':    'scanline 8s linear infinite',
        'blink':       'blink 1s step-end infinite',
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.35s ease-out',
        'flicker':     'flicker 0.15s ease-in-out 2',
      },
      keyframes: {
        pulseAmber: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.4 },
        },
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0 },
        },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        flicker: {
          '0%,100%': { opacity: 1 },
          '50%':     { opacity: 0.85 },
        },
      },
    },
  },
  plugins: [],
};