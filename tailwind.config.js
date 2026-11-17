/** @type {import('tailwindcss').Config} */

// Raku world: one set of clay neutrals (carbon → smoke) per festival, plus an
// "ember" scale that marks whatever is live right now. Each festival's ember
// follows a real raku flash colour: Arab = fire orange, Global = copper-flash
// turquoise, Alt Spaces = copper-red.
// `primary` = clay neutrals, `secondary` / `accent` = ember (kept as two names
// so existing class names keep resolving).

const festival = process.env.FESTIVAL ?? 'arabic';

const clay = {
  arabic: {
    50: '#f2f1ee', 100: '#e7e5e1', 200: '#d1cec8', 300: '#aeaaa3',
    400: '#85817a', 500: '#625e58', 600: '#45423e', 700: '#2f2d2b',
    800: '#1d1c1b', 900: '#131312', 950: '#0b0b0b',
  },
  global: {
    50: '#f0f2f0', 100: '#e3e7e4', 200: '#ccd2ce', 300: '#a7afaa',
    400: '#7f8882', 500: '#5c645f', 600: '#414743', 700: '#2c302d',
    800: '#1b1e1c', 900: '#121413', 950: '#0a0c0b',
  },
  alt_spaces: {
    50: '#f1f2f4', 100: '#e5e6e9', 200: '#cdcfd4', 300: '#a8abb2',
    400: '#80838b', 500: '#5d6067', 600: '#424449', 700: '#2c2e32',
    800: '#1c1d20', 900: '#121315', 950: '#0a0a0c',
  },
};

const ember = {
  arabic: {
    50: '#fff1ec', 100: '#ffdccf', 200: '#ffb59c', 300: '#ff8a66',
    400: '#ff6a3d', 500: '#f04e1f', 600: '#cf3c12', 700: '#a92f0e',
    800: '#7f240c', 900: '#521808', 950: '#2e0d04',
  },
  global: {
    50: '#e8fbf6', 100: '#c6f4e8', 200: '#8ee8d2', 300: '#52d7b8',
    400: '#22c29d', 500: '#10a684', 600: '#0b856b', 700: '#0c6a56',
    800: '#0d5345', 900: '#0b3a31', 950: '#04201b',
  },
  alt_spaces: {
    50: '#fff0f3', 100: '#ffdbe3', 200: '#ffb3c5', 300: '#ff7f9e',
    400: '#ff4d78', 500: '#ef2d5e', 600: '#cc1b49', 700: '#a6153c',
    800: '#7c1230', 900: '#520c20', 950: '#2e0611',
  },
};

const key = clay[festival] ? festival : 'arabic';
const c = clay[key];
const e = ember[key];

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: c,
        secondary: e,
        accent: e,
        ember: e,
        clay: c,
        theatre: {
          black: { 900: c[900], 950: c[950] },
          curtain: { 500: e[600] },
          gold: { 400: e[400], 500: e[500] },
          wood: { 500: c[600] },
          parchment: { 50: c[50] },
        },
        reservation: { 500: e[500], 600: e[600] },
        waiting: { 500: c[500], 600: c[600] },
      },
      fontFamily: {
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-dark': '0 18px 40px -12px rgba(0,0,0,0.65)',
        kiln: '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 48px -24px rgba(0,0,0,0.7)',
      },
      letterSpacing: {
        label: '0.14em',
      },
      keyframes: {
        cool: {
          '0%': { color: e[400], textShadow: `0 0 28px ${e[500]}99` },
          '100%': {},
        },
        smoke: {
          '0%': { opacity: '0.35', filter: 'blur(10px)' },
          '100%': { opacity: '1', filter: 'blur(0)' },
        },
      },
      animation: {
        cool: 'cool 1.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        smoke: 'smoke 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};
