<script lang="ts">
	import { onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { GAME_BANNER_MESSAGE, type GameBannerMessage } from './game-banner.types'

	interface Props {
		type?: GameBannerMessage
		onsound?: (type: GameBannerMessage) => void
		onfinish?: () => void
	}

	const {
		type = GAME_BANNER_MESSAGE.VICTORY,
		onsound,
		onfinish,
	}: Props = $props()

	const isVictory = $derived(type === GAME_BANNER_MESSAGE.VICTORY)

	let contentVisible = $state(false)

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && contentVisible) {
			onfinish?.()
		}
	}

	onMount(() => {
		onsound?.(type)

		const textTimer = setTimeout(() => {
			contentVisible = true
		}, 2400)

		window.addEventListener('keydown', handleKeydown)

		return () => {
			clearTimeout(textTimer)
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

<div class="overlay" in:fade={{ duration: 900 }}>
	{#if contentVisible}
		<div class="content" in:fade={{ duration: 500 }}>
			<div class="row">
				<div class="line" class:victory={isVictory} class:fail={!isVictory}></div>

				<div class="message-wrapper">
					<p class="message shadow" class:victory={isVictory} class:fail={!isVictory} aria-hidden="true">{type}</p>
					<p class="message" class:victory={isVictory} class:fail={!isVictory}>{type}</p>
				</div>

				<div class="line line-right" class:victory={isVictory} class:fail={!isVictory}></div>
			</div>

			<p class="press-enter" class:victory={isVictory} class:fail={!isVictory}>
				PRESS ENTER TO CONTINUE
			</p>
		</div>
	{/if}
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(3px);
	}

	.content {
		width: 100%;
		padding: 0 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 2rem;
		width: 100%;
	}

	.line {
		flex: 1;
		height: 1px;
	}

	.line.victory {
		background: linear-gradient(to right, transparent, #c8a96e 80%);
	}

	.line.fail {
		background: linear-gradient(to right, transparent, #9b2020 80%);
	}

	.line.line-right.victory {
		background: linear-gradient(to left, transparent, #c8a96e 80%);
	}

	.line.line-right.fail {
		background: linear-gradient(to left, transparent, #9b2020 80%);
	}

	.message-wrapper {
		position: relative;
		display: inline-block;
	}

	.message {
		font-size: clamp(1.4rem, 3.5vw, 2.8rem);
		font-weight: 300;
		letter-spacing: 0.35em;
		text-transform: uppercase;
		white-space: nowrap;
		text-align: center;
	}

	.message:not(.shadow) {
		position: relative;
		z-index: 1;
	}

	.message:not(.shadow).victory {
		color: #c8a96e;
		text-shadow:
			0 0 20px rgba(200, 169, 110, 0.7),
			0 0 60px rgba(200, 169, 110, 0.3);
	}

	.message:not(.shadow).fail {
		color: #cc3333;
		text-shadow:
			0 0 20px rgba(204, 51, 51, 0.7),
			0 0 60px rgba(204, 51, 51, 0.3);
	}

	.message.shadow {
		position: absolute;
		inset: 0;
		z-index: 0;
		animation: tremble 0.25s steps(1) infinite;
		user-select: none;
	}

	.message.shadow.victory {
		color: transparent;
		text-shadow:
			3px 2px 0 rgba(200, 169, 110, 0.5),
			-2px -1px 0 rgba(200, 169, 110, 0.3),
			0 0 18px rgba(200, 169, 110, 0.6);
	}

	.message.shadow.fail {
		color: transparent;
		text-shadow:
			3px 2px 0 rgba(204, 51, 51, 0.5),
			-2px -1px 0 rgba(204, 51, 51, 0.3),
			0 0 18px rgba(204, 51, 51, 0.6);
	}

	@keyframes tremble {
		0%   { transform: translate(0px, 0px) skewX(0deg);    opacity: 0.8; filter: blur(2px); }
		12%  { transform: translate(-3px, 1px) skewX(-1deg);  opacity: 0.5; filter: blur(4px); }
		25%  { transform: translate(2px, -2px) skewX(0.8deg); opacity: 0.9; filter: blur(1px); }
		37%  { transform: translate(-2px, 3px) skewX(-0.5deg);opacity: 0.4; filter: blur(5px); }
		50%  { transform: translate(3px, -1px) skewX(1.2deg); opacity: 0.7; filter: blur(2px); }
		62%  { transform: translate(-1px, -3px) skewX(-0.8deg);opacity: 0.6; filter: blur(3px); }
		75%  { transform: translate(2px, 2px) skewX(0.4deg);  opacity: 0.3; filter: blur(6px); }
		87%  { transform: translate(-3px, -1px) skewX(1deg);  opacity: 0.8; filter: blur(2px); }
		100% { transform: translate(0px, 0px) skewX(0deg);    opacity: 0.8; filter: blur(2px); }
	}

	.press-enter {
		font-size: clamp(0.55rem, 1vw, 0.8rem);
		letter-spacing: 0.4em;
		text-transform: uppercase;
		margin-top: 2.5rem;
		animation: blink 1.4s ease-in-out infinite;
	}

	.press-enter.victory {
		color: rgba(200, 169, 110, 0.65);
	}

	.press-enter.fail {
		color: rgba(204, 51, 51, 0.65);
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0.15; }
	}
</style>