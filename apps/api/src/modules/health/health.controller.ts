import Elysia from "elysia";

export const HealthController = new Elysia({ name: "Health.Controller" }).get(
	"/health",
	() => "OK",
);
