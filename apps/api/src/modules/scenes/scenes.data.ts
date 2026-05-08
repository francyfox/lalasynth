import { env } from '@/env'
import { CharFrames } from "@/modules/character/character.frame";
import type { Scene } from "@/modules/scenes/scenes.types";

const s = (path: string) => `${env.API_URL}${path}`;

export const ScenesData = [
	{
		name: "intro-1",
		bg: s("/static/bg/open_evening.webp"),
		message:
			"Lala: My dear $user, since you've lost your voice, I shall be your instrument. Lalasynth is a \n " +
			"rhythmic game where you pick a YouTube.Music track and outpace others in a typing battle royale.\n",
		music: s("/static/sound/dialogue.m4a"),
		char: s("/static/nun/neutral.webp"),
		frame: CharFrames.idleC,
	},
	{
		name: "intro-2",
		bg: s("/static/bg/open_evening.webp"),
		message:
			"Lala: Win to claim your glory and a unique badge for your GitHub profile.",
		music: s("/static/sound/dialogue.m4a"),
		char: s("/static/nun/neutral.webp"),
		frame: CharFrames.idleD,
	},
	{
		name: "intro-3",
		bg: s("/static/bg/open_evening.webp"),
		message: "Lala: Let your fingers sing, $user ...",
		music: s("/static/sound/dialogue.m4a"),
		char: s("/static/nun/neutral.webp"),
	},
	{
		name: "lobby",
		bg: s("/static/bg/open_evening.webp"),
		music: s("/static/sound/lobby.m4a"),
	},
	{
		name: "game",
		bg: s("/static/bg/closed_night.webp"),
	},
].map((i, index) => {
	return {
		...i,
		id: index,
	};
}) as Scene[];
