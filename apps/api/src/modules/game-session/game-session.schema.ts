import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const gameSessionSchema = sqliteTable("session", {
	users: text("users"),
});
