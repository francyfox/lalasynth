export default {
	content: [
		"./apps/*/src/**/*.{js,ts,svelte}",
		"./packages/*/src/**/*.{js,ts,svelte}",
		"node_modules/ui/src/**/*.{js,ts,svelte}",
	],
	theme: {
		extend: {},
	},
	daisyui: {
		themes: ["light", "dark", "dracula"],
	},
};
