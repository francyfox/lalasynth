const CHAR_MAP: Record<string, string> = {
	"—": "-",
	"–": "-",
	"\u201C": '"',
	"\u201D": '"',
	"\u2018": "'",
	"\u2019": "'",
	"`": "'",
	"…": "...",
	"\u00A0": " ",
	"ё": "е",
	"Ё": "Е",
};

const CHAR_RE = new RegExp(
	Object.keys(CHAR_MAP)
		.map((k) => k.replace(/[.*+?^${}()|[\\\]]/g, "\\$&"))
		.join("|"),
	"g",
);

const LRC_LINE_RE = /^\[(\d{2}:\d{2}\.\d{2})\]\s*(.*)$/;
const MAX_LINE_CHARS = 40;

function lrcToMs(ts: string): number {
	const [min, rest] = ts.split(":");
	const [sec, cs] = rest.split(".");
	return (parseInt(min, 10) * 60 + parseInt(sec, 10)) * 1000 + parseInt(cs, 10) * 10;
}

function msToLrc(ms: number): string {
	const total = Math.max(0, ms);
	const min = Math.floor(total / 60000);
	const sec = Math.floor((total % 60000) / 1000);
	const cs = Math.floor((total % 1000) / 10);
	return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function findSplitPoint(text: string): number {
	const mid = Math.floor(text.length / 2);
	let l = mid;
	let r = mid;
	while (l > 0 || r < text.length - 1) {
		if (text[l] === " ") return l;
		if (text[r] === " ") return r;
		if (l > 0) l--;
		if (r < text.length - 1) r++;
	}
	return mid;
}

function doNormalize(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(CHAR_RE, (m) => CHAR_MAP[m] ?? m);
}

function doSplitLongLines(text: string): string {
	const lines = text.split("\n");
	const result: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(LRC_LINE_RE);

		if (!match || match[2].length <= MAX_LINE_CHARS) {
			result.push(lines[i]);
			continue;
		}

		const [, ts, line] = match;
		const splitAt = findSplitPoint(line);
		const part1 = line.slice(0, splitAt).trim();
		const part2 = line.slice(splitAt).trim();

		const nextMatch = lines
			.slice(i + 1)
			.find((l) => LRC_LINE_RE.test(l))
			?.match(LRC_LINE_RE);

		const currentMs = lrcToMs(ts);
		const nextMs = nextMatch ? lrcToMs(nextMatch[1]) : currentMs + 3000;
		const part2Ms = currentMs + Math.round((nextMs - currentMs) * (part1.length / line.length));

		result.push(`[${ts}] ${part1}`);
		result.push(`[${msToLrc(part2Ms)}] ${part2}`);
	}

	return result.join("\n");
}

type LyricProcessor = {
	normalize: () => LyricProcessor;
	splitLongLines: () => LyricProcessor;
	stripPunctuation: () => LyricProcessor;
	value: () => string;
};

export function lyricProcessor(text: string | null | undefined): LyricProcessor {
	const str = text ?? "";
	return {
		normalize: () => lyricProcessor(doNormalize(str)),
		splitLongLines: () => lyricProcessor(doSplitLongLines(str)),
		stripPunctuation: () => lyricProcessor(str.replace(/['"]/g, "")),
		value: () => str,
	};
}