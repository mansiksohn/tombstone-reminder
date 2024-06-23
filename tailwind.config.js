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
        'soul-green-50': '#EEFBF6',
        'soul-green-100': '#D7F4E8',
        'soul-green-200': '#B1E9D4',
        'soul-green-300': '#7ED7BC',
        'soul-green-400': '#49BE9D',
        'soul-green-500': '#27A385',
        'soul-green-600': '#19826B',
        'soul-green-700': '#146858',
        'soul-green-800': '#125347',
        'soul-green-900': '#10443B',
        'soul-green-950': '#082622',
        'text-real-white': '#FFFFFF',
        'text-real-black': '#000000',
      },
    },
  },
  variants: {},
  plugins: [],
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};

