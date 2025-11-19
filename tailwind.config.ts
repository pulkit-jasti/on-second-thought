import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				comic: {
					yellow: '#FFD700',
					blue: '#00BFFF',
					red: '#FF4444',
					purple: '#9B59B6',
					cream: '#FFFEF0',
					black: '#000000',
					white: '#FFFFFF',
				},
			},
			fontFamily: {
				comic: ['var(--font-comic)', 'cursive', 'sans-serif'],
				heading: ['var(--font-heading)', 'Impact', 'sans-serif'],
			},
			boxShadow: {
				comic: '8px 8px 0px 0px rgba(0, 0, 0, 1)',
				'comic-sm': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
				'comic-lg': '12px 12px 0px 0px rgba(0, 0, 0, 1)',
				'comic-hover': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
				'comic-button': '6px 6px 0px 0px rgba(0, 0, 0, 1)',
				'comic-button-hover': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
				'comic-button-active': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
			},
			borderWidth: {
				'3': '3px',
				'4': '4px',
			},
			screens: {
				xs: '320px',
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1536px',
			},
		},
	},
	plugins: [],
};

export default config;
