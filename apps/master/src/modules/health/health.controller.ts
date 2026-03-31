import Elysia, { t } from "elysia";

export const HealthController = new Elysia({ name: "Health.Controller" }).get(
	"/health",
	// @ts-ignore
	() => "OK",
	{
		detail: {
			description: "Health check for ping services",
		},
		response: t.Literal("OK"),
	},
);
