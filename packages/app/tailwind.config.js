/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        panel: '#11141a',
        surface: '#161b22',
        edge: '#262d38',
        accent: '#3ddc97',
        accent2: '#2d9cdb',
        danger: '#e5484d',
      },
    },
  },
  plugins: [],
};
