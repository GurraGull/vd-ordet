import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F3EA',
        ink: '#0E3A5E',
        gold: '#C8A24A',
        muted: '#5E6B76',
        night: '#0B0F14',
        panel: '#0E141B',
        line: '#1E2730',
        amber: '#E0A23C',
        steel: '#9FACB6',
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
        sans: ['var(--font-franklin)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
