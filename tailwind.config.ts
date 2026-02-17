import type { Config } from 'tailwindcss';

export default {
	content: [
		'./apps/*/src/**/*.{js,ts,svelte}',
		'./packages/*/src/**/*.{js,ts,svelte}',
		'node_modules/ui/src/**/*.{js,ts,svelte}',
	],
	theme: {
		extend: {},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['light', 'dark', 'dracula'],
	},
} satisfies Config;
