export const GAME_BANNER_MESSAGE = {
	FAIL: ' LOSS OF SYNCHRONIZATION',
	VICTORY: 'CONNECTION RESTORED',
} as const

export type GameBannerMessage = (typeof GAME_BANNER_MESSAGE)[keyof typeof GAME_BANNER_MESSAGE]