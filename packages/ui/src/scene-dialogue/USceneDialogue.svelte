<script lang="ts">
	import { animate } from "animejs";

	interface Props {
		message: string;
		speed?: number;
		next?: () => void;
	}

	let { message, speed = 20, next }: Props = $props();

	let currentLength = $state(0);
	let isTyping = $state(false);
	let animRef: { cancel: () => void } | null = null;

	let displayed = $derived(message.slice(0, currentLength));

	function skip() {
		if (!isTyping || !animRef) return;
		animRef.cancel();
		currentLength = message.length;
		isTyping = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.code === "Space" && isTyping) {
			e.preventDefault();
			skip();
		} else if (e.code === "ArrowUp" && !isTyping) {
			if (next) next()
		}
	}

	$effect(() => {
		currentLength = 0;
		isTyping = true;

		const obj = { val: 0 };
		const anim = animate(obj, {
			val: message.length,
			duration: message.length * speed,
			ease: "linear",
			onUpdate: () => {
				currentLength = Math.round(obj.val);
			},
			onComplete: () => {
				isTyping = false;
			},
		});

		animRef = anim;
		return () => anim.cancel();
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="mt-auto flex flex-col w-full min-h-[200px] h-[30vh] bg-base-300 rounded-lg text-3xl p-5 gap-2">
	<div class="overflow-auto h-[8ch]">
		<div class="flex-1 text">{displayed}{#if isTyping}<span class="cursor">▌</span>{/if}</div>
	</div>

	<div class="mt-auto ml-auto">
		{#if isTyping}
			<p class="hint !text-2xl"><kbd class="kbd kbd-xl">Backspace</kbd> - skip</p>
		{:else}
			<div class="flex gap-5 items-center">
				<button
						type="button"
						class="kbd kbd-xl cursor-pointer"
						onclick={next}
				>
					Next
				</button>
				<p class="hint !text-2xl"><kbd class="kbd kbd-xl">Backspace</kbd> - next</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.text {
		white-space: pre-wrap;
	}

	.cursor {
		animation: blink 0.6s step-end infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	.hint {
		font-size: 0.875rem;
		text-align: right;
		opacity: 0.5;
	}
</style>