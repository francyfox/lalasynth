<script lang="ts">
	import { codeToHtml } from 'shiki'

	interface Props {
		code: string
		lang?: string
		theme?: string
	}

	const { code, lang = 'typescript', theme = 'tokyo-night' }: Props = $props()

	let html = $state('')
	let copied = $state(false)

	$effect(() => {
		codeToHtml(code, { lang, theme }).then((result) => {
			html = result
		})
	})

	async function copy() {
		await navigator.clipboard.writeText(code)
		copied = true
		setTimeout(() => { copied = false }, 2000)
	}
</script>

<div class="rounded-lg overflow-hidden border border-white/8 text-sm leading-relaxed">
	<div class="flex items-center justify-between px-4 py-1.5 bg-white/4 border-b border-white/8">
		<span class="text-xs tracking-widest uppercase text-white/35 font-mono">{lang}</span>
		<button
			onclick={copy}
			class="text-xs font-mono text-white/35 hover:text-white/70 transition-colors duration-150 cursor-pointer"
		>
			{copied ? 'copied!' : 'copy'}
		</button>
	</div>
	<div class="overflow-x-auto">
		{#if html}
			{@html html}
		{:else}
			<pre class="m-0 px-5 py-4 bg-[#1a1b26] text-[#a9b1d6] font-mono"><code>{code}</code></pre>
		{/if}
	</div>
</div>

<style>
	div :global(pre) {
		margin: 0;
		padding: 1rem 1.25rem;
		background: transparent !important;
	}
</style>