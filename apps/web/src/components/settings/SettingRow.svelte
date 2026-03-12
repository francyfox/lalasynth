<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		label: string;
		description?: string;
		children: Snippet;
	}

	let { label, description, children }: Props = $props();
</script>

<div class="flex items-center justify-between gap-4 py-2">
	<div class="flex flex-col">
		<span class="font-bold text-xl">{label}</span>
		{#if description}
			<span class="text-md text-base-content/60">{description}</span>
		{/if}
	</div>
	<div class="flex items-center">
		{@render children()}
	</div>
</div>