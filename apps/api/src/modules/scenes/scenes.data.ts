import { CharFrames } from "@/modules/character/character.frame";
import type { Scene } from "@/modules/scenes/scenes.types";

export const ScenesData = [
	{
		name: "intro-1",
		bg: `/static/bg/open_evening.webp`,
		message:
			"Lala: My dear $user, since you've lost your voice, I shall be your instrument. Lalasynth is a \n " +
			"rhythmic game where you pick a YouTube.Music track and outpace others in a typing battle royale.\n",
		music: `/static/sound/dialogue.m4a`,
		char: `/static/nun/neutral.webp`,
		frame: CharFrames.idleC,
	},
	{
		name: "intro-2",
		bg: `/static/bg/open_evening.webp`,
		message:
			"Lala: Win to claim your glory and a unique badge for your GitHub profile.",
		music: `/static/sound/dialogue.m4a`,
		char: `/static/nun/neutral.webp`,
		frame: CharFrames.idleD,
	},
	{
		name: "intro-3",
		bg: `/static/bg/open_evening.webp`,
		message: "Lala: Let your fingers sing, $user ...",
		music: `/static/sound/dialogue.m4a`,
		char: `/static/nun/neutral.webp`,
	},
	{
		name: "lobby",
		bg: `/static/bg/open_evening.webp`,
		music: `/static/sound/lobby.m4a`,
	},
	{
		name: "game",
		bg: `/static/bg/closed_night.webp`,
	},
].map((i, index) => {
	return {
		...i,
		id: index,
	};
}) as Scene[];
