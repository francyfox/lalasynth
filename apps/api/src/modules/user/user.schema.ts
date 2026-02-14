import { createId } from "@paralleldrive/cuid2";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

export const UserSchema = sqliteTable("user", {
	id: text("id")
		.$defaultFn(() => createId())
		.primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),

	bestWpm: real("best_wpm").default(0),
	totalWins: integer("total_wins").default(0),
});

export const selectUserSchema = createSelectSchema(UserSchema);
export const insertUserSchema = createInsertSchema(UserSchema);
