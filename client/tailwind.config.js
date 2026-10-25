/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        paper: 'var(--color-paper)',
        muted: 'var(--color-muted)',
        neoYellow: 'var(--color-yellow)',
        neoPink: 'var(--color-pink)',
        neoCoral: 'var(--color-coral)',
        neoBlue: 'var(--color-blue)',
        neoGreen: 'var(--color-green)',
        neoPurple: 'var(--color-purple)',
        neoOrange: 'var(--color-orange)',
        danger: 'var(--color-danger)',
        dangerBg: 'var(--color-danger-bg)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'hard-sm': 'var(--shadow-hard-sm)',
        'hard-md': 'var(--shadow-hard-md)',
        'hard-lg': 'var(--shadow-hard-lg)',
        'hard-hover': 'var(--shadow-hard-hover)',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
