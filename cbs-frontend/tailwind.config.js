/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial / academic palette — warm parchment + ink + sienna accent
        parchment: {
          50: '#FAF7F0',
          100: '#F5F1E8',
          200: '#EDE6D6',
          300: '#DFD4BC',
        },
        ink: {
          900: '#0F1419',
          800: '#1A1F26',
          700: '#2A3038',
          600: '#3D4450',
          500: '#5C6470',
          400: '#8B919C',
        },
        sienna: {
          500: '#C2410C',
          600: '#9A3412',
          700: '#7C2D12',
        },
        forest: {
          600: '#2F4A2F',
          700: '#1F2D1A',
        },
      },
      fontFamily: {
        // Display: variable serif; Sans: editorial sans; Mono: technical
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
    },
  },
  plugins: [],
};
