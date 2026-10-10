/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Red Wine Primary Color Palette
        wine: {
          50: '#fdf2f2',
          100: '#fce6e6',
          200: '#f8c9c9',
          300: '#f29d9d',
          400: '#ea6262',
          500: '#e13d3d', // Primary red wine
          600: '#c92a2a',
          700: '#a81919',
          800: '#8a1616',
          900: '#721414',
          950: '#3d0a0a',
        },
        // Apple Glass Dark Theme
        glass: {
          bg: '#0a0a0a',
          surface: '#1c1c1e',
          elevated: '#2c2c2e',
          border: 'rgba(255, 255, 255, 0.1)',
          borderLight: 'rgba(255, 255, 255, 0.15)',
          text: '#ffffff',
          textSecondary: 'rgba(255, 255, 255, 0.6)',
          textTertiary: 'rgba(255, 255, 255, 0.4)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        // You can add custom fonts here if needed
      },
    },
  },
  plugins: [],
}

