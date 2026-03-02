export interface SpriteConfig<T extends string> {
	image: string;
	width: number;
	height: number;
	frames: readonly T[];
}

export function createSpriteManager<T extends string>(config: SpriteConfig<T>) {
	const { width, height, frames, image } = config;

	const positions = frames.reduce(
		(acc, name, index) => {
			acc[name] = `-${index * width}px 0px`;
			return acc;
		},
		{} as Record<T, string>,
	);

	const getPosition = (frame: T): string => positions[frame];

	const getStyles = (frame: T) =>
		`
    width: ${width}px;
    height: ${height}px;
    background-position: ${positions[frame]};
    background-size: ${width * frames.length}px ${height}px;
    image-rendering: pixelated;
    background-image: url(${config.image});
  `
			.replace(/\s+/g, " ")
			.trim();

	return {
		getPosition,
		getStyles,
		NAMES: frames.reduce(
			(acc, name) => {
				acc[name] = name;
				return acc;
			},
			{} as { [K in T]: K },
		),
	};
}
