export function safeFilename(name: string): string {
	return name.replace(/^.*[\\/]/, "");
}

export function filenameHash(filename: string): number {
	let hash = 5381;
	for (let i = 0; i < filename.length; i++) {
		hash = (Math.imul(hash, 33) ^ filename.charCodeAt(i)) >>> 0;
	}
	return hash;
}

export function lrcToPlain(lrc: string): string {
	return lrc
		.split("\n")
		.map((line) => line.replace(/^\[[\d:.]+]\s*/, ""))
		.filter((line) => line.trim())
		.join("\n");
}

export function sanitizeFilename(name: string): string {
	return name
		.replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
		.trim()
		.slice(0, 200);
}

/**
 * Shift all LRC timestamps by offsetMs milliseconds.
 * Lines with resulting negative timestamps are dropped.
 * LRC format: [MM:SS.cc]text  (cc = centiseconds)
 */
export function applyLrcOffset(lrc: string, offsetMs: number): string {
	return lrc
		.split("\n")
		.map((line) => {
			const match = line.match(/^\[(\d{2}):(\d{2}\.\d{2})](.*)/);
			if (!match) return line;
			const [, mm, ss, text] = match;
			const totalMs = (parseInt(mm) * 60 + parseFloat(ss)) * 1000 + offsetMs;
			if (totalMs < 0) return "";
			const newMm = Math.floor(totalMs / 60000);
			const newSs = ((totalMs % 60000) / 1000).toFixed(2).padStart(5, "0");
			return `[${String(newMm).padStart(2, "0")}:${newSs}]${text}`;
		})
		.filter((line) => line !== "")
		.join("\n");
}
