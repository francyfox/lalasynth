import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";

export const swaggerDocs: ElysiaSwaggerConfig = {
	documentation: {
		info: {
			title: "LalaSynth API",
			description:
				"🎵 Reactive karaoke racing game API - Get audio from YouTube and sync lyrics",
			version: "1.0.0",
		},
		servers: [
			{
				url: "http://localhost:3000",
				description: "Development server",
			},
		],
		tags: [
			{ name: "Song", description: "Song and audio endpoints" },
		],
	},
};