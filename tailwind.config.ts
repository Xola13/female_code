import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Luna Beauty brand palette — soft pinks, golds, warm neutrals
        luna: {
          blush: '#F9B8C8',
          rose: '#E8839A',
          berry: '#C94F6D',
          gold: '#D4AF72',
          champagne: '#F5E6C8',
          cream: '#FDF6F0',
          mink: '#8B6B5E',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        // Elegant serif for headings, clean sans for body
        display: ['var(--font-display)', 'Playfair Display', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        sans: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 114, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 114, 0.6)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF72 0%, #F5E6C8 50%, #D4AF72 100%)',
        'rose-gradient': 'linear-gradient(135deg, #F9B8C8 0%, #E8839A 50%, #C94F6D 100%)',
        'hero-gradient': 'linear-gradient(135deg, #FDF6F0 0%, #F9B8C8 30%, #E8839A 70%, #C94F6D 100%)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
