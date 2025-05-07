/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#3d5a80', // Elegant navy blue
          light: '#98c1d9', // Light blue
          dark: '#293241', // Dark navy
        },
        secondary: {
          main: '#d8a48f', // Soft coral/rose gold
          light: '#f2d0c2', // Light coral
          dark: '#c27c66', // Dark coral
        },
        error: {
          main: '#c1666b', // Muted red
          light: '#e48f93', // Light red
          dark: '#a34e52', // Dark red
        },
        success: {
          main: '#739e82', // Muted green
          light: '#a3c4ae', // Light green
          dark: '#5c7e68', // Dark green
        },
        info: {
          main: '#8896ab', // Muted blue-gray
          light: '#b1bbc8', // Light blue-gray
          dark: '#6e7a8c', // Dark blue-gray
        },
        warning: {
          main: '#d4b483', // Muted gold
          light: '#e6d2b3', // Light gold
          dark: '#b39059', // Dark gold
        },
        background: {
          default: '#f8f5f2', // Warm off-white
          paper: '#ffffff',
          card: '#fcfbf9', // Slightly off-white for cards
        },
        text: {
          primary: '#2d3748', // Dark slate
          secondary: '#4a5568', // Medium slate
          disabled: '#a0aec0', // Light slate
          accent: '#3d5a80', // Navy accent
        },
        accent: {
          gold: '#d4b483',
          rose: '#d8a48f',
          navy: '#3d5a80',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        elegant: '0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.03)',
        card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        none: 'none',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
        serif: ['"Noto Serif JP"', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'pattern-dots': 'radial-gradient(#3d5a80 0.5px, transparent 0.5px)',
        'pattern-lines':
          'linear-gradient(to right, #f2d0c2 1px, transparent 1px), linear-gradient(to bottom, #f2d0c2 1px, transparent 1px)',
      },
      backgroundSize: {
        'dots-sm': '10px 10px',
        'dots-md': '20px 20px',
        'lines-sm': '20px 20px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
