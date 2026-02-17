const DRACULA_PALETTE = [
	"#bd93f9",
	"#ff79c6",
	"#8be9fd",
	"#50fa7b",
	"#f1fa8c",
	"#ffb86c",
	"#ff5555",
];

let lastColorIndex = -1;

export function getRandomDraculaColor(): string {
	let newIndex: number;

	do {
		newIndex = Math.floor(Math.random() * DRACULA_PALETTE.length);
	} while (newIndex === lastColorIndex);

	lastColorIndex = newIndex;
	return `linear-gradient(
                to bottom,
                ${DRACULA_PALETTE[newIndex]} 0%,
                #44475a 100%
        );`;
}
