import type { ElysiaSwaggerConfig } from "@elysiajs/swagger";

export const swaggerDocs: ElysiaSwaggerConfig = {
	documentation: {
		info: {
			title: "LalaSynth Master API",
			description: "🎮 Master server — auth, users, rooms, leaderboard",
			version: "1.0.0",
		},
		servers: [
			{
				url: "http://localhost:4000",
				description: "Development server",
			},
		],
		tags: [
			{ name: "User", description: "User management" },
			{ name: "Auth", description: "Authentication (Better Auth OAuth)" },
			{ name: "Rooms", description: "Active game rooms" },
			{ name: "Server", description: "Game server registry" },
		],
	},
};
