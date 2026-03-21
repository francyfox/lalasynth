import { eq } from "drizzle-orm";
import { db } from "@/db";
import { bestWpmBadge } from "@/modules/badge/badge.templates";
import { UserSchema } from "@/modules/user/user.schema";

export type BadgeType = "best_wpm";

const BADGE_TYPES = ["best_wpm"] as const satisfies BadgeType[];
export { BADGE_TYPES };

const BADGE_RENDERERS: Record<BadgeType, (value: number | null) => string> = {
	best_wpm: bestWpmBadge,
};

export const BadgeService = () => ({
	getBadge: async (userId: string, type: BadgeType): Promise<string> => {
		const [user] = await db
			.select({ bestWpm: UserSchema.bestWpm })
			.from(UserSchema)
			.where(eq(UserSchema.id, userId));

		if (!user) throw new Error("User not found");

		return BADGE_RENDERERS[type](user.bestWpm ?? null);
	},
});
