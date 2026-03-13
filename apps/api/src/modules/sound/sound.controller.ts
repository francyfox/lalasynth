import Elysia, { t } from "elysia";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const SOUNDS_DIR = join(import.meta.dir, "../../../public/sounds");

export const SoundController = new Elysia({ name: "Sound.Controller" })
	.get(
		"/sounds",
		async () => {
			const files = await readdir(SOUNDS_DIR);
			return files
				.filter((f) => f.endsWith(".webm") || f.endsWith(".mp3") || f.endsWith(".ogg"))
				.map((f) => ({ name: f.replace(/\.[^.]+$/, ""), filename: f }));
		},
		{
			detail: { description: "List available background sounds" },
			response: t.Array(t.Object({ name: t.String(), filename: t.String() })),
		},
	);