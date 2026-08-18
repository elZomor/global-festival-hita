/** @type {import('tailwindcss').Config} */

const festival = process.env.FESTIVAL ?? 'arabic';

const palettes = {
  arabic: {
    primary: {
      50: '#f6f3ef', 100: '#e8e1d9', 200: '#cfc4b7', 300: '#b19d86',
      400: '#856f67', 500: '#584136', 600: '#473d37', 700: '#312924',
      800: '#211814', 900: '#0b0807', 950: '#050403',
    },
    secondary: {
      50: '#fbf6ee', 100: '#f3e7d3', 200: '#e2cfa8', 300: '#c9b07b',
      400: '#a47139', 500: '#8f5f2e', 600: '#734b24', 700: '#58391c',
      800: '#3f2a15', 900: '#2a1c0e', 950: '#160f07',
    },
    accent: {
      50: '#f6eef1', 100: '#e6cfd7', 200: '#cfa0af', 300: '#b16d85',
      400: '#8f3f5f', 500: '#682745', 600: '#58203a', 700: '#44182d',
      800: '#311120', 900: '#1f0a14', 950: '#11050b',
    },
    theatre: {
      black:    { 900: '#0b0807', 950: '#050403' },
      curtain:  { 500: '#682745' },
      gold:     { 500: '#a47139' },
      wood:     { 500: '#584136' },
      parchment:{ 50:  '#f6f3ef' },
    },
    reservation: { 500: '#a47139', 600: '#8f5f2e' },
    waiting:     { 500: '#682745', 600: '#58203a' },
  },
  global: {
    primary: {
      50: '#f5f4f2', 100: '#e8e4df', 200: '#d0c9c0', 300: '#b0a698',
      400: '#8c7d6e', 500: '#6b5d50', 600: '#4e4238', 700: '#352c24',
      800: '#221c16', 900: '#14100c', 950: '#0c0906',
    },
    secondary: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#059669', 600: '#047857', 700: '#065f46',
      800: '#064e3b', 900: '#022c22', 950: '#011a15',
    },
    accent: {
      50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
      400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
      800: '#115e59', 900: '#134e4a', 950: '#042f2e',
    },
    theatre: {
      black:    { 900: '#14100c', 950: '#0c0906' },
      curtain:  { 500: '#14b8a6' },
      gold:     { 500: '#059669' },
      wood:     { 500: '#6b5d50' },
      parchment:{ 50:  '#f5f4f2' },
    },
    reservation: { 500: '#d97706', 600: '#b45309' },
    waiting:     { 500: '#7c3aed', 600: '#6d28d9' },
  },
  alt_spaces: {
    primary: {
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
      400: '#a1a1aa', 500: '#3f3f46', 600: '#27272a', 700: '#18181b',
      800: '#0d0d0e', 900: '#09090b', 950: '#050505',
    },
    secondary: {
      50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
      400: '#22d3ee', 500: '#0891b2', 600: '#0e7490', 700: '#155e75',
      800: '#164e63', 900: '#083344', 950: '#04222e',
    },
    accent: {
      50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
      400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
      800: '#9f1239', 900: '#4c0519', 950: '#2d0410',
    },
    theatre: {
      black:    { 900: '#09090b', 950: '#050505' },
      curtain:  { 500: '#f43f5e' },
      gold:     { 500: '#0891b2' },
      wood:     { 500: '#3f3f46' },
      parchment:{ 50:  '#fafafa' },
    },
    reservation: { 500: '#0891b2', 600: '#0e7490' },
    waiting:     { 500: '#d97706', 600: '#b45309' },
  },
};

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: palettes[festival] ?? palettes.arabic,
      fontFamily: {
        display: ['var(--font-display)', '"Playfair Display"', 'serif'],
        sans:    ['var(--font-sans)', 'Roboto', 'sans-serif'],
        arabic:  ['var(--font-arabic)', 'serif'],
      },
      boxShadow: {
        'glow-dark': '0 0 40px rgba(0,0,0,0.65)',
      },
    },
  },
  plugins: [],
};
