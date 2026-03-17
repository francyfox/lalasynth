<script lang="ts">
	import { cn } from "../utils.ts";

	interface Props {
		label: string;
		onclick?: () => void;
		disabled?: boolean;
	}

	let { label, onclick, disabled = false }: Props = $props();
</script>

<button
	type="button"
	class={cn(disabled ? "opacity-50 pointer-events-none" : "", "group relative px-4 py-1 text-left")}
	aria-label={label}
	{onclick}
	{disabled}
>
	<span class="relative z-10 text-[#ffffff] font-mono text-lg uppercase tracking-wider group-focus:text-[#ffff00] group-hover:text-[#ffff00]">
		{label}
	</span>
	<span class="absolute inset-0 hidden group-hover:block group-focus:block bg-[#0000ff] border border-dotted border-white opacity-50"></span>
</button>