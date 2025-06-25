/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: '#F5F5F7',
        'glass-bg': 'rgba(255, 255, 255, 0.7)',
        text: '#1D1D1F',
        'text-secondary': '#86868B',
        accent: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 