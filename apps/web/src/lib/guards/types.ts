import type { Router } from "@roxi/routify";

export interface GuardContext {
	route: unknown;
	router: Router;
}

// Тип для отдельной функции-защитника
export type GuardFn = (context: GuardContext) => Promise<boolean> | boolean;
