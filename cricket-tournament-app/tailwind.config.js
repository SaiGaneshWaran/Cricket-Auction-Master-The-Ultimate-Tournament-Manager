tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cricket theme colors
        pitch: {
          light: '#8BC34A',
          DEFAULT: '#689F38',
          dark: '#33691E',
        },
        cricket: {
          red: '#E53935',   // Cricket ball color
          white: '#F5F5F5', // Cricket ball seam
          wood: '#A1887F',  // Bat color
          pitch: '#8D6E63',  // Pitch color
        },
        tournament: {
          primary: '#1E3A8A',    // Primary blue
          secondary: '#6366F1',  // Secondary indigo
          accent: '#F59E0B',     // Accent yellow
          dark: '#0F172A',       // Dark background
          light: '#F1F5F9',      // Light text
        },
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        cricket: ['Oswald', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0,0,0,0.1), 0 0 15px -5px rgba(0,0,0,0.1)',
        'button': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        'highlight': '0 0 15px 2px rgba(99, 102, 241, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cricket-pattern': "url('/images/cricket-pattern.png')",
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    // Optional plugins to enhance your UI
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ],
}