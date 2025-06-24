/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define custom font families based on the plan
        sans: ['Inter', 'sans-serif'], // Primary font for general text
        mono: ['IBM Plex Mono', 'monospace'], // Monospace font for code/logs
      },
      colors: {
        // Define custom color palette based on the :root variables from HTML samples
        // These will override or extend Tailwind's default colors
        primary: 'var(--bg-primary)',
        secondary: 'var(--bg-secondary)',
        card: 'var(--bg-card)',
        text: 'var(--text-color)',
        'text-secondary': 'var(--text-secondary)',
        'accent-blue': 'var(--accent-blue)',
        'accent-green': 'var(--accent-green)',
        'accent-red': 'var(--accent-red)',
        'accent-orange': 'var(--accent-orange)',
        border: 'var(--border-color)',
      },
      borderRadius: {
        DEFAULT: 'var(--border-radius)',
      },
      transitionTimingFunction: {
        DEFAULT: 'var(--transition-speed)',
      },
      boxShadow: {
        light: 'var(--shadow-light)',
        dark: 'var(--shadow-dark)',
      },
    },
  },
  plugins: [],
}
