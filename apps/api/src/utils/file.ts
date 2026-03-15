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