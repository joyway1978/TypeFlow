module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        desk: '#EDE7DD',
        paper: {
          DEFAULT: '#F8F4ED',
          raised: '#FCFAF5',
        },
        ink: {
          DEFAULT: '#1C1B1A',
          faded: '#6B6560',
        },
        'paper-edge': '#DDD6CB',
        'correct-ink': '#3A6B35',
        'teacher-red': '#C44536',
        'pencil-grey': '#8B8680',
        'bookmark-gold': {
          DEFAULT: '#B8860B',
          hover: '#9B7018',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
        brand: ['"Instrument Serif"', '"Source Serif 4"', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.2' }],
        h1: ['1.75rem', { lineHeight: '1.3' }],
        h2: ['1.25rem', { lineHeight: '1.4' }],
        input: ['1.125rem', { lineHeight: '1.6' }],
      },
      maxWidth: {
        paper: '672px',
      },
      boxShadow: {
        paper: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
