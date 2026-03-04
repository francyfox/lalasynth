// LRC format: [mm:ss.xx] text
import type { LyricLine } from "./lyric-sync.types.ts";

const LRC_RE = /^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/;

export function parseSyncedLyrics(raw: string, totalDuration = 0): LyricLine[] {
	const entries: { start: number; text: string }[] = [];

	for (const line of raw.split("\n")) {
		const m = LRC_RE.exec(line.trim());
		if (!m || !m[1] || !m[2] || !m[3]) continue;
		const text = m[3].trim();
		if (!text) continue;
		entries.push({ start: parseInt(m[1]) * 60 + parseFloat(m[2]), text });
	}

	entries.sort((a, b) => a.start - b.start);

	return entries.map((e, i) => ({
		text: e.text,
		start: e.start,
		end: entries[i + 1]?.start ?? totalDuration,
	}));
}
