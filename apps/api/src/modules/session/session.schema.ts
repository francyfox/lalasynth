import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { UserSchema } from "@/modules/user/user.schema";

export const session = sqliteTable("session", {
	id: numeric("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => UserSchema.id),
});
