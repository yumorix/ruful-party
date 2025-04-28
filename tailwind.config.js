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
          main: '#1976d2', // blue[700]
          light: '#42a5f5', // blue[400]
          dark: '#1565c0', // blue[800]
        },
        secondary: {
          main: '#e91e63', // pink[500]
          light: '#f06292', // pink[300]
          dark: '#c2185b', // pink[700]
        },
        error: {
          main: '#f44336', // red[500]
          light: '#ef5350', // red[400]
          dark: '#d32f2f', // red[700]
        },
        success: {
          main: '#4caf50', // green[500]
          light: '#66bb6a', // green[400]
          dark: '#388e3c', // green[700]
        },
        info: {
          main: '#2196f3', // blue[500]
          light: '#42a5f5', // blue[400]
          dark: '#1976d2', // blue[700]
        },
        warning: {
          main: '#ff9800', // orange[500]
          light: '#ffb74d', // orange[300]
          dark: '#f57c00', // orange[700]
        },
        background: {
          default: '#f5f5f5',
          paper: '#ffffff',
        },
        text: {
          primary: 'rgba(0, 0, 0, 0.87)',
          secondary: 'rgba(0, 0, 0, 0.6)',
          disabled: 'rgba(0, 0, 0, 0.38)',
        },
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        none: 'none',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
