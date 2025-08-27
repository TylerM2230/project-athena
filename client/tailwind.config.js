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
        // Dynamic theme colors using CSS variables
        'term': {
          'bg': 'var(--theme-bg)',
          'bg-alt': 'var(--theme-bg-alt)', 
          'border': 'var(--theme-border)',
          'surface': 'var(--theme-surface)',
          'text': 'var(--theme-text)',
          'text-dim': 'var(--theme-text-dim)',
          'accent': 'var(--theme-accent)',
          'warning': 'var(--theme-warning)',
          'error': 'var(--theme-error)',
          'info': 'var(--theme-info)',
          'success': 'var(--theme-success)',
        },
        // Keep some existing colors for compatibility
        'void': {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#333333',
          600: '#555555',
          500: '#777777',
          400: '#999999',
          300: '#bbbbbb',
        },
        'neon-cyan': {
          400: '#00ffff',
          500: '#00cccc',
        },
        'quantum-green': {
          400: '#00ff00',
          500: '#00cc00',
        },
        'plasma-pink': {
          400: '#ff00ff',
        },
        'electric-purple': {
          400: '#ff00ff',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
        'sans': ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'], // Override default sans
      },
      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.6' }],    // 13px
        'sm': ['0.9375rem', { lineHeight: '1.6' }],    // 15px  
        'base': ['1.0625rem', { lineHeight: '1.6' }],  // 17px (increased from 16px)
        'lg': ['1.25rem', { lineHeight: '1.6' }],      // 20px
        'xl': ['1.5rem', { lineHeight: '1.5' }],       // 24px
        '2xl': ['1.875rem', { lineHeight: '1.4' }],    // 30px
        '3xl': ['2.25rem', { lineHeight: '1.3' }],     // 36px
        '4xl': ['2.75rem', { lineHeight: '1.2' }],     // 44px
      },
      boxShadow: {
        'terminal': '0 0 0 1px var(--theme-border)',
        'terminal-focus': '0 0 0 2px var(--theme-accent)',
        'term-accent': '0 4px 6px -1px var(--theme-accent)',
        'term-accent-lg': '0 10px 15px -3px var(--theme-accent)',
      },
      animation: {
        'cursor': 'cursor 3s ease-in-out infinite',
        'typing': 'typing 3.5s steps(30, end), cursor 1s linear infinite',
        'blob': 'blob 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
      },
      keyframes: {
        cursor: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        typing: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blob: {
          '0%': { 
            transform: 'translateX(var(--blob-from)) scaleX(0.9) scaleY(1.1)',
          },
          '50%': { 
            transform: 'translateX(calc((var(--blob-from) + var(--blob-to)) / 2)) scaleX(1.05) scaleY(0.95)' 
          },
          '100%': { 
            transform: 'translateX(var(--blob-to)) scaleX(1) scaleY(1)',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      }
    },
  },
  plugins: [],
}