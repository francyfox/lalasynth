import type { Handler } from "elysia";

export type ElysiaHandler<TSchema extends Record<string, unknown> = {}> =
	Handler<TSchema, any, "/">;
