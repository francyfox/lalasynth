import { env } from '@/env'
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema"

const client = createClient({
  url: env.NODE_ENV === 'development' ? "file:local.db" : env.TURSO_CONNECTION_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });