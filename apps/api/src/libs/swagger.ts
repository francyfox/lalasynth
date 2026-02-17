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
			{ name: "User", description: "User management" },
			{ name: "Song", description: "Song and audio endpoints" },
			{ name: "Auth", description: "Authentication (Better Auth OAuth)" },
		],
		paths: {
			"/api/auth/signin/github": {
				get: {
					tags: ["Auth"],
					summary: "Sign in with GitHub",
					description:
						"Redirects to GitHub OAuth consent screen. User will be prompted to authorize the application.",
					parameters: [
						{
							name: "redirect_url",
							in: "query",
							description: "Where to redirect after successful login",
							required: false,
							schema: {
								type: "string",
								example: "http://localhost:5173/dashboard",
							},
						},
					],
					responses: {
						302: {
							description: "Redirect to GitHub OAuth",
							headers: {
								location: { description: "GitHub OAuth URL" },
							},
						},
					},
				},
			},
			"/api/auth/callback/github": {
				get: {
					tags: ["Auth"],
					summary: "GitHub OAuth callback handler",
					description:
						"GitHub redirects here after user authorization. Session is automatically created.",
					parameters: [
						{
							name: "code",
							in: "query",
							description: "GitHub authorization code",
							required: true,
							schema: { type: "string" },
						},
						{
							name: "state",
							in: "query",
							description: "State parameter for CSRF protection",
							required: true,
							schema: { type: "string" },
						},
					],
					responses: {
						302: {
							description: "Redirect to frontend with session established",
							headers: {
								"set-cookie": { description: "Session cookie" },
							},
						},
						400: { description: "Invalid code or state" },
					},
				},
			},
			"/api/auth/session": {
				get: {
					tags: ["Auth"],
					summary: "Get current session",
					description:
						"Returns the currently authenticated user and their session info.",
					responses: {
						200: {
							description: "User session",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											user: {
												type: "object",
												properties: {
													id: { type: "string", example: "user_123" },
													email: {
														type: "string",
														example: "user@github.com",
													},
													name: {
														type: "string",
														example: "Fox Developer",
													},
													image: {
														type: "string",
														example:
															"https://avatars.githubusercontent.com/...",
													},
													createdAt: {
														type: "string",
														format: "date-time",
													},
												},
											},
											session: {
												type: "object",
												properties: {
													token: { type: "string" },
													expiresAt: {
														type: "string",
														format: "date-time",
													},
												},
											},
										},
									},
								},
							},
						},
						401: { description: "Not authenticated" },
					},
				},
			},
			"/api/auth/signout": {
				post: {
					tags: ["Auth"],
					summary: "Sign out",
					description: "Invalidates the current user session.",
					responses: {
						200: {
							description: "Successfully signed out",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											success: { type: "boolean", example: true },
										},
									},
								},
							},
						},
						401: { description: "Not authenticated" },
					},
				},
			},
		},
	},
};
