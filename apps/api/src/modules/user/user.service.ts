import { eq } from "drizzle-orm";
import { db } from "@/db";
import { UserSchema } from "@/modules/user/user.schema";

export const UserService = () => {
	return {
		updateUser: async (id: string, values: Record<string, any>) => {
			const user = await db
				.select()
				.from(UserSchema)
				.where(eq(UserSchema.id, id));

			if (user.length === 0) throw new Error("User not found");
			const query = db
				.update(UserSchema)
				.set(values)
				.where(eq(UserSchema.id, id));

			return query;
		},
	};
};
