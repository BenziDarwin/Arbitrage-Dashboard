/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'arb-green': '#10b981',
        'arb-red': '#ef4444',
        'arb-blue': '#3b82f6',
      },
    },
  },
  plugins: [],
}
