import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";
import * as schema from "./schema";

export const client = createClient({
	url:
		env.NODE_ENV === "development" ? "file:local.db" : env.TURSO_CONNECTION_URL,
	authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
