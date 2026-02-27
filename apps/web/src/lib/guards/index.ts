import { authGuard } from "@/lib/guards/auth.guard";
import { skipIntroGuard } from "@/lib/guards/skip-intro.guard";
import type { GuardContext, GuardFn } from "@/lib/guards/types";

const index: GuardFn[] = [authGuard, skipIntroGuard];

export const runGuards = async (context: GuardContext): Promise<boolean> => {
	for (const guard of index) {
		const result = await guard(context);
		if (!result) return false;
	}
	return true;
};
