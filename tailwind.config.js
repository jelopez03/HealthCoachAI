/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  safelist: [
    // Dynamic classes used in ChatInterface quick prompts
    'border-emerald-200',
    'bg-emerald-50',
    'hover:bg-emerald-100',
    'text-emerald-600',
    'text-emerald-800',
    'border-blue-200',
    'bg-blue-50',
    'hover:bg-blue-100',
    'text-blue-600',
    'text-blue-800',
    'border-purple-200',
    'bg-purple-50',
    'hover:bg-purple-100',
    'text-purple-600',
    'text-purple-800',
    'border-orange-200',
    'bg-orange-50',
    'hover:bg-orange-100',
    'text-orange-600',
    'text-orange-800',
  ],
  plugins: [],
};