import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: 'rgb(var(--c-gold) / <alpha-value>)',
          light: 'rgb(var(--c-gold-light) / <alpha-value>)',
          dark: 'rgb(var(--c-gold-dark) / <alpha-value>)',
        },
        burgundy: {
          DEFAULT: 'rgb(var(--c-burgundy) / <alpha-value>)',
          light: 'rgb(var(--c-burgundy-light) / <alpha-value>)',
          dark: 'rgb(var(--c-burgundy-dark) / <alpha-value>)',
        },
        obsidian: {
          DEFAULT: '#0d0d0d',
          card: '#141414',
          border: '#262626',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
