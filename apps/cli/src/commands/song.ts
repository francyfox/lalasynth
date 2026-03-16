import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
	applyLrcOffset,
	downloadToFile,
	LrclibProvider,
	sanitizeFilename,
	YtdlpProvider,
} from "@app/api/providers";
import { defineCommand, option } from "@bunli/core";
import { z } from "zod";

const SONGS_PATH =
	process.env.LALASYNTH_SONGS_PATH ??
	`${join(process.cwd(), "../api/public/songs")}`;

const songCommand = defineCommand({
	name: "song",
	description: "Download song with audio and lyrics to public/songs",
	options: {
		audioProvider: option(z.enum(["ytdlp"]).default("ytdlp"), {
			description: "Select audio provider",
			short: "a",
		}),
		lyricProvider: option(z.enum(["lrclib"]).default("lrclib"), {
			description: "Select lyrics provider",
			short: "l",
		}),
		url: option(z.url(), {
			description: "URL from provider",
			short: "u",
		}),
		offset: option(z.coerce.number().default(0), {
			description: "Lyric offset in milliseconds (positive = delay lyrics)",
		}),
	},
	handler: async ({ flags, spinner, colors }) => {
		const { url, offset } = flags;

		// ── Step 1: fetch metadata ────────────────────────────────────────────
		const metaSpinner = spinner();
		metaSpinner.start("Fetching song metadata...");

		let song: {
			videoId: string;
			title?: string;
			author?: string;
			duration?: number;
		};

		try {
			const audio = YtdlpProvider();
			song = (await audio.getSong(url)) as typeof song;
			const label = song.author
				? `${song.author} – ${song.title}`
				: (song.title ?? song.videoId);
			metaSpinner.succeed(`Found: ${label}`);
		} catch (err) {
			metaSpinner.fail(
				`Failed to fetch metadata: ${err instanceof Error ? err.message : String(err)}`,
			);
			process.exit(1);
		}

		// ── Step 2: fetch lyrics ──────────────────────────────────────────────
		const lyricSpinner = spinner();
		lyricSpinner.start("Fetching lyrics...");

		let syncedLyrics: string;

		try {
			const lrc = LrclibProvider();
			const query =
				[song.author, song.title].filter(Boolean).join(" ") || song.videoId;
			const lyrics = (await lrc.getLyrics(query, song.duration ?? 0)) as Array<{
				syncedLyrics: string | null;
			}>;
			const lyric = lyrics[0];

			if (!lyric?.syncedLyrics) {
				lyricSpinner.warn(
					`No synced lyrics found for: ${song.title ?? song.videoId}`,
				);
				process.exit(1);
			}

			syncedLyrics = lyric.syncedLyrics;
			lyricSpinner.succeed("Lyrics found");
		} catch (err) {
			lyricSpinner.fail(
				`Failed to fetch lyrics: ${err instanceof Error ? err.message : String(err)}`,
			);
			process.exit(1);
		}

		// ── Step 3: build filenames ───────────────────────────────────────────
		const base = sanitizeFilename(
			song.author
				? `${song.author} - ${song.title ?? song.videoId}`
				: (song.title ?? song.videoId),
		);
		const filename = `${base}.webm`;
		const lrcFilename = `${base}.lrc`;

		// ── Step 4: download audio ────────────────────────────────────────────
		const dlSpinner = spinner();
		dlSpinner.start("Downloading audio (this may take a while)...");

		try {
			await mkdir(SONGS_PATH, { recursive: true });
			await downloadToFile(song.videoId, `${SONGS_PATH}/${filename}`);
			dlSpinner.succeed("Download complete");
		} catch (err) {
			dlSpinner.fail(
				`Download failed: ${err instanceof Error ? err.message : String(err)}`,
			);
			process.exit(1);
		}

		// ── Step 5: write LRC ─────────────────────────────────────────────────
		const lrcContent =
			offset !== 0 ? applyLrcOffset(syncedLyrics, offset) : syncedLyrics;
		await writeFile(`${SONGS_PATH}/${lrcFilename}`, lrcContent, "utf-8");

		console.log(`\n${colors.green("✓")} Audio:  ${colors.bold(filename)}`);
		console.log(`${colors.green("✓")} Lyrics: ${colors.bold(lrcFilename)}`);
		if (offset !== 0) {
			console.log(
				colors.dim(`  (lyrics offset: ${offset > 0 ? "+" : ""}${offset}ms)`),
			);
		}
	},
});

export default songCommand;
