/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kiwi: {
          DEFAULT: '#CCFF00', // Electric Kiwi Lime
          yellow: '#FFFF00',  // Tangy Electric Yellow
          chartreuse: '#DFFF00', // Fluorescent Chartreuse
          dark: '#000000',    // Pitch Black Void
          surface: '#0A0B08', // Dark Carbon/Olive Surface
          surfaceHover: '#11130D',
          border: '#1E2313',  // Dark Kiwi Border
          borderBright: '#3A4423',
          muted: '#8E9A76',   // Technical Sage Muted
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'kiwi-glow': '0 0 25px -5px rgba(204, 255, 0, 0.25)',
        'kiwi-glow-sm': '0 0 12px -2px rgba(204, 255, 0, 0.3)',
        'yellow-glow': '0 0 25px -5px rgba(255, 255, 0, 0.25)',
      },
      backgroundImage: {
        'dot-matrix': 'radial-gradient(#202516 1.2px, transparent 1.2px)',
        'dot-matrix-dense': 'radial-gradient(#252D19 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px',
        'dot-grid-sm': '12px 12px',
      },
    },
  },
  plugins: [],
};

