import { t } from "elysia";
export const StatsSchema = t.Object({
	cpu: t.Number({ description: "CPU %" }),
	memory: t.Number({ description: "Memory %" }),
	turso: t.Object({
		read: t.Number({ description: "DB Turso read %" }),
		write: t.Number({ description: "DB Turso write %" }),
		storage: t.Number({ description: "DB Turso Storage %" }),
	}),
});
