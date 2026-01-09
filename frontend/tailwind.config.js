module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0d0e0fff',
        light: '#f9fafb',
        primary: '#e10600',
        secondary: '#00419f',
        accent: '#ffd700',
        'primary-hover': '#b80500',
        'primary-hover-underline': '#ff0800ff',
      },
    },
  },
  plugins: [],
}