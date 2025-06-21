/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sicredi: {
          green: '#0F9D58',
        },
      },
    },
  },
  plugins: [],
}
