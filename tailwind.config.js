/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        reveal: {
          '0%': { 
            filter: 'brightness(1)',
          },
          '20%': { 
            filter: 'brightness(1.3)',
          },
          '80%': { 
            filter: 'brightness(1.3)',
          },
          '100%': { 
            filter: 'brightness(1)',
          }
        },
        'fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        reveal: 'reveal 3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.5s ease-out forwards'
      }
    }
  },
  plugins: [],
}