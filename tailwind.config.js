/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily:{
        'sans': ['Noto Sans KR']
      },
      fontWeight: {
        normal: '400',
        bold: '700',
      },
      colors: {
        'real-black': '#000000',
        'real-white': '#FFFFFF',
        'grey-111': '#111111',
        'grey-333': '#333333',
        'grey-666': '#666666',
        'grey-999': '#999999',
        'soul-green-50': '#CCFFEA',
        'soul-green-100': '#99FFD5',
        'soul-green-200': '#66FFBF',
        'soul-green-300': '#33FFAA',
        'soul-green-400': '#00FF95',
        'soul-green-500': '#00DC82',
        'soul-green-600': '#00B368',
        'soul-green-700': '#00804A',
        'soul-green-800': '#004D2D',
        'soul-green-900': '#001A0F',
        'soul-green-950': '#000C07',
        'text-real-white': '#FFFFFF',
        'text-real-black': '#000000',
      },
    },
  },
  variants: {},
  plugins: [],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};

