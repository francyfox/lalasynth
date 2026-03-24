<script lang="ts">
	import { onMount } from 'svelte'
	import type { LyricLine } from "../lyric-sync/lyric-sync.types.ts"
	import { cn } from "../utils.ts"

	interface Props {
		lines: LyricLine[]
		currentTime: number
		onPause: () => void
		onResume: () => void
		isPlaying: boolean
		className?: string
	}

	const { lines, currentTime, onPause, onResume, isPlaying, className = "" }: Props = $props()

	// --- Core game state ---

	let pairIdx = $state(0)
	let lineInPair = $state(0) // 0 = typing line0, 1 = typing line1, 2 = pair complete
	let cursor = $state(0)
	let gamePaused = $state(false)

	// Typing stats
	let mistakes = $state(0)
	let typedChars = $state(0)
	let isWrong = $state(false)
	let wrongKey = $state("")

	// WPM tracking — wall-clock time, not audio time
	let startTime = $state(0)
	let elapsedTime = $state(0)

	// --- Derived display values ---

	const pairStart = $derived(pairIdx)
	const line0 = $derived(lines[pairStart])
	const line1 = $derived(lines[pairStart + 1])

	// --- WPM ---

	const wpm = $derived.by(() => {
		if (!startTime || elapsedTime <= startTime) return 0
		const minutes = (elapsedTime - startTime) / 1000 / 60
		return Math.round(typedChars / 5 / minutes) || 0
	})

	// --- Progress ---

	const progress = $derived.by(() => {
		if (lines.length === 0) return 0
		const totalChars = lines.reduce((sum, l) => sum + l.text.length, 0)
		if (totalChars === 0) return 0

		// Count chars from all fully completed lines before current pairIdx
		let completedChars = 0
		for (let i = 0; i < pairStart; i++) {
			const l = lines[i]
			if (l !== undefined) completedChars += l.text.length
		}

		// Add chars from lines already typed within the current pair
		if (lineInPair >= 1) {
			const l0 = lines[pairStart]
			if (l0 !== undefined) completedChars += l0.text.length
		}
		if (lineInPair >= 2) {
			const l1 = lines[pairStart + 1]
			if (l1 !== undefined) completedChars += l1.text.length
		}

		// Add cursor position in current active line
		const currentLineChars = lineInPair < 2 ? cursor : 0

		return Math.round(((completedChars + currentLineChars) / totalChars) * 100)
	})

	function showNextPair() {
		pairIdx++
		lineInPair = 0
		cursor = 0
	}

	// --- rAF gate check ---

	$effect(() => {
		if (!isPlaying) return

		let rafId: number

		const tick = () => {
			if (!gamePaused) {
				const l0 = lines[pairStart]
				const l1 = lines[pairStart + 1]

				// Gate per line: pause if music reached line start but line not typed yet
				if (l0 && currentTime >= l0.start && lineInPair === 0) {
					gamePaused = true
					onPause()
				} else if (l1 && currentTime >= l1.start && lineInPair < 2) {
					gamePaused = true
					onPause()
				}
			}
			rafId = requestAnimationFrame(tick)
		}

		rafId = requestAnimationFrame(tick)

		return () => cancelAnimationFrame(rafId)
	})

	// --- WPM interval ---

	$effect(() => {
		if (!isPlaying) return

		const interval = setInterval(() => {
			elapsedTime = Date.now()
		}, 500)

		return () => clearInterval(interval)
	})

	// --- Keydown handler ---

	function handleKeydown(e: KeyboardEvent) {
		e.preventDefault()
		e.stopPropagation()

		if (!isPlaying || e.key.length !== 1) return

		const activeLine =
			lineInPair === 0 ? line0 : lineInPair === 1 ? line1 : undefined
		if (activeLine === undefined) return

		const targetChar = activeLine.text[cursor]
		if (targetChar === undefined) return

		if (e.key === targetChar) {
			isWrong = false
			cursor++
			typedChars++
			if (startTime === 0) startTime = Date.now()

			if (cursor === activeLine.text.length) {
				lineInPair++
				cursor = 0
				if (gamePaused) {
					gamePaused = false
					onResume()
				}
				showNextPair()
			}
		} else {
			mistakes++
			isWrong = true
			wrongKey = e.key
		}
	}

	$effect(() => {
		if (!isPlaying) return
		window.addEventListener("keydown", handleKeydown, { capture: true })
		return () => window.removeEventListener("keydown", handleKeydown, { capture: true })
	})

	// --- Char class helpers ---

	function getCharClass(charI: number, isActive: boolean, isCompleted: boolean): string {
		const isTyped = isCompleted || (isActive && charI < cursor)
		const isCurrent = isActive && charI === cursor

		return cn(
			"relative inline-flex w-[1ch] justify-center transition-all duration-150 ease-in-out",
			isTyped
				? "text-orange-500 [text-shadow:0_0_12px_rgba(249,115,22,0.6)]"
				: "text-zinc-100",
			isCurrent ? "scale-110 font-bold" : "scale-100",
		)
	}
</script>

<div class={cn(className, "py-5 flex flex-col gap-2 items-center text-scroller text-4xl text-center font-mono shadow-sm")}>
	<!-- Indicators zone — fixed height so lyrics layout never shifts -->
	<div class="flex justify-center items-center h-10">
		{#if isWrong}
			<kbd class="kbd kbd-xl">{wrongKey}</kbd>
		{:else if gamePaused}
			<span class="text-warning text-sm animate-pulse">&#9646; Finish typing to continue</span>
		{/if}
	</div>

	<div class="overflow-hidden flex justify-center">
		<div class="w-full max-w-[50vw] flex flex-col gap-2">

			<!-- Line 0 row -->
			{#if line0 !== undefined}
				{@const line0Active = lineInPair === 0}
				{@const line0Completed = lineInPair > 0}
				<p class={cn(
					"flex flex-wrap text-4xl leading-none transition-all duration-150",
					line0Completed ? "opacity-30" : "opacity-100",
				)}>
					{#each line0.text as char, i (i)}
						<span class={getCharClass(i, line0Active, line0Completed)}>
							{char}
							{#if line0Active && i === cursor}
								<span class="absolute -bottom-0 left-0 h-[4px] w-full bg-orange-400 shadow-[0_0_20px_#fb923c] animate-pulse"></span>
							{/if}
						</span>
					{/each}
				</p>
			{/if}

			<!-- Line 1 row -->
			{#if line1 !== undefined}
				{@const line1Active = lineInPair === 1}
				{@const line1Completed = lineInPair === 2}
				{@const line1Pending = lineInPair === 0}
				<p class={cn(
					"flex flex-wrap text-4xl leading-none transition-all duration-150",
					line1Completed ? "opacity-30" : line1Pending ? "opacity-50" : "opacity-100",
				)}>
					{#each line1.text as char, i (i)}
						<span class={getCharClass(i, line1Active, line1Completed)}>
							{char}
							{#if line1Active && i === cursor}
								<span class="absolute -bottom-0 left-0 h-[4px] w-full bg-orange-400 shadow-[0_0_20px_#fb923c] animate-pulse"></span>
							{/if}
						</span>
					{/each}
				</p>
			{/if}

		</div>
	</div>

	<!-- Stats bar -->
	<div class="mt-8 text-sm text-zinc-400">
		Mistakes: {mistakes} | Progress: {progress}% | WPM: {wpm}
	</div>
</div>

<style lang="postcss">
	.text-scroller {
		position: relative;
		background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, color-mix(in oklch, var(--color-base-200), transparent 5%) 20%, color-mix(in oklch, var(--color-base-200), transparent 5%) 80%, rgba(0, 0, 0, 0) 100%);
	}
</style>