import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import * as schema from "@/db/schema";
import { env } from "@/env";
import { db } from "./db";

export const auth = betterAuth({
	trustedOrigins: [env.CLIENT_URL],
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_BASE_URL,
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: {
			...schema,
			user: schema.UserSchema,
			session: schema.session,
			account: schema.account,
			verification: schema.verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
	},
	user: {
		additionalFields: {
			bestWpm: { type: "number", input: false },
			totalWins: { type: "number", input: false },
			level: { type: "number", input: false },
		},
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID ?? "",
			clientSecret: env.GITHUB_CLIENT_SECRET ?? "",
		},
	},
	plugins: [
		anonymous({
			onLinkAccount: async ({ anonymousUser, newUser }) => {
				// TODO: migrate stats from anonymousUser to newUser if needed
			},
		}),
	],
});
