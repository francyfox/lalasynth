<script lang="ts">
	import type { Snippet } from "svelte"

	interface Props {
		baseUrl: string
		children?: Snippet
	}

	let { baseUrl, children }: Props = $props()

	interface LayerConfig {
		image: string
		speed: number
	}

	const layers: LayerConfig[] = [
		{ image: "menu_bg3.webp", speed: 6 },
		{ image: "menu_bg1.webp", speed: 14 },
		{ image: "menu_bg2.webp", speed: 22 },
	]

	let offsets = $state<{ x: number; y: number }[]>(
		layers.map(() => ({ x: 0, y: 0 })),
	)

	let rafId: number | null = null

	function handleMouseMove(e: MouseEvent) {
		if (rafId !== null) {
			cancelAnimationFrame(rafId)
		}

		rafId = requestAnimationFrame(() => {
			const nx = e.clientX / window.innerWidth - 0.5
			const ny = e.clientY / window.innerHeight - 0.5

			offsets = layers.map((layer) => ({
				x: nx * -layer.speed,
				y: ny * -layer.speed,
			}))

			rafId = null
		})
	}

	$effect(() => {
		window.addEventListener("mousemove", handleMouseMove)

		return () => {
			window.removeEventListener("mousemove", handleMouseMove)
			if (rafId !== null) {
				cancelAnimationFrame(rafId)
			}
		}
	})
</script>

<div class="parallax-container">
	{#each layers as layer, i (layer.image)}
		<div
			class="parallax-layer"
			style="background-image: url('{baseUrl}/{layer.image}'); transform: translate({offsets[i].x}px, {offsets[i].y}px); z-index: {i};"
		></div>
	{/each}

	<div class="parallax-content">
		{@render children?.()}
	</div>
</div>

<style>
	.parallax-container {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.parallax-layer {
		position: absolute;
		inset: -30px;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		will-change: transform;
		transition: transform 0.1s linear;
	}

	.parallax-content {
		position: relative;
		z-index: 10;
		width: 100%;
		height: 100%;
	}
</style>