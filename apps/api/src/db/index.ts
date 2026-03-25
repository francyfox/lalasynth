import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";
import * as schema from "./schema";

export const client = createClient({
	url: env.TURSO_CONNECTION_URL ?? "file:local.db",
	authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
