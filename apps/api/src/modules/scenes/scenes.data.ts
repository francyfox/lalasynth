import { env } from "@/env";
import type { Scene } from "@/modules/scenes/scenes.types";

export const ScenesData = [
	{
		name: "intro-1",
		bg: `${env.BETTER_AUTH_BASE_URL}/static/bg/open_evening.webp`,
		message:
			"My dear $user, since you've lost your voice, I shall be your instrument. Lalasynth is a \n " +
			"rhythmic game where you pick a YouTube track and outpace others in a typing battle royale.\n",
		music: `${env.BETTER_AUTH_BASE_URL}/static/sound/dialogue.m4a`,
	},
	{
		name: "intro-2",
		bg: `${env.BETTER_AUTH_BASE_URL}/static/bg/open_evening.webp`,
		message:
			"Win to claim your glory and a unique badge for your GitHub profile.",
		music: `${env.BETTER_AUTH_BASE_URL}/static/sound/dialogue.m4a`,
	},
	{
		name: "intro-3",
		bg: `${env.BETTER_AUTH_BASE_URL}/static/bg/open_evening.webp`,
		message: "Let your fingers sing, $user ...",
		music: `${env.BETTER_AUTH_BASE_URL}/static/sound/dialogue.m4a`,
	},
	{
		name: "lobby",
		bg: `${env.BETTER_AUTH_BASE_URL}/static/bg/open_evening.webp`,
		music: `${env.BETTER_AUTH_BASE_URL}/static/sound/lobby.m4a`,
	},
	{
		name: "game",
		bg: `${env.BETTER_AUTH_BASE_URL}/static/bg/closed_evening.webp`,
	},
].map((i, index) => {
	return {
		...i,
		id: index,
	};
}) as Scene[];
