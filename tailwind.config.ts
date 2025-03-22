
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				peach: {
					50: '#FFF9F5',
					100: '#FFF3EA',
					200: '#FEE1CB',
					300: '#FDC9A6',
					400: '#FEC196',
					500: '#FD9F5B',
					600: '#E47E37',
					700: '#C96633',
					800: '#A34920',
					900: '#7B3211',
				},
				maroon: {
					50: '#FCF5F8',
					100: '#F9EBF1',
					200: '#F0D0DE',
					300: '#E4A9C5',
					400: '#D87EAA',
					500: '#C05088',
					600: '#A93C73',
					700: '#8C325F',
					800: '#6F244A',
					900: '#521A37',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' }
				},
				'slide-in': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-out': {
					from: { transform: 'translateY(0)', opacity: '1' },
					to: { transform: 'translateY(10px)', opacity: '0' }
				},
				'scale-in': {
					from: { transform: 'scale(0.98)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.98)', opacity: '0' }
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-8px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'accordion-up': 'accordion-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-in': 'fade-in 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				'fade-out': 'fade-out 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-in': 'slide-in 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				'slide-out': 'slide-out 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-in': 'scale-in 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				'scale-out': 'scale-out 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
				float: 'float 6s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Bricolage Grotesque', 'sans-serif'],
				bricolage: ['Bricolage Grotesque', 'sans-serif']
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
