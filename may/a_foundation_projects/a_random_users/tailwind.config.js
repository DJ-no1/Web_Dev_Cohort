/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': 'oklch(0.16 0.01 255)',
        'app-surface': 'oklch(0.21 0.012 255)',
        'app-fg': 'oklch(0.96 0.006 255)',
        'app-muted': 'oklch(0.68 0.018 255)',
        'app-border': 'oklch(0.29 0.014 255)',
        'like': 'oklch(0.74 0.17 150)',
        'dislike': 'oklch(0.66 0.19 25)',
      },
      borderRadius: {
        'card': '18px',
        'btn': '8px',
      },
    },
  },
  plugins: [],
}
