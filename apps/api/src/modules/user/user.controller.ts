import { Elysia, t } from "elysia";
import { UserService } from "@/modules/user/user.service";

export const UserController = new Elysia({ name: "User.Controller" }).patch(
	"/user/:id",
	async ({ params: { id }, body: { level }, status }) => {
		console.warn("TEST", id, level);
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
