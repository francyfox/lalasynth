import { Elysia, t } from "elysia";
import { BADGE_TYPES, BadgeService } from "@/modules/user/badge.service";
import { UserService } from "@/modules/user/user.service";

export const UserController = new Elysia({ name: "User.Controller" })
	.get(
		"/user/:id/badge",
		async ({ params: { id }, query: { type }, set }) => {
			set.headers["content-type"] = "image/svg+xml";
			set.headers["cache-control"] = "no-cache, no-store";
			return BadgeService().getBadge(id, type);
		},
		{
			detail: { description: "Get user badge as SVG image" },
			params: t.Object({ id: t.String() }),
			query: t.Object({
				type: t.UnionEnum(BADGE_TYPES, { default: "best_wpm" }),
			}),
		},
	)
	.patch(
		"/user/:id",
		async ({ params: { id }, body: { level } }) => {
			await UserService().updateUser(id, { level });
		},
		{
			detail: {
				description: "Update user level",
			},
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				level: t.Number(),
			}),
		},
	);
