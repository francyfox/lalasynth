import { db } from '@/db'
import { env } from '@/env'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Elysia } from 'elysia'
import { betterAuth } from "better-auth";
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      bestWpm: { type: "number" },
      rank: { type: "string" },
      totalWins: { type: "number" }
    }
  },
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
});
export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
        });

        if (!session) return status(401);

        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });