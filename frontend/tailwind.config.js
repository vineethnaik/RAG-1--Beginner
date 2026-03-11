/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0D0E10',
          surface: '#14161A',
          surface2: '#1B1E24',
          border: '#272B33',
          border2: '#32373F',
        },
        accent: {
          gold: '#F0C040',
          orange: '#F0904A',
        },
        text: {
          primary: '#E4E2DB',
          secondary: '#96938D',
          muted: '#52504C',
        },
        status: {
          success: '#52C47A',
          error: '#E85D4A',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
