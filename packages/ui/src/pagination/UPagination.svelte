<script lang="ts">
	import { cn } from "../utils.ts";

	interface Props {
		page: number;
		pageSize: number;
		total: number;
		onPageChange?: (page: number) => void;
		className?: string;
	}

	let {
		page = $bindable(1),
		pageSize,
		total,
		onPageChange,
		className,
	}: Props = $props();

	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	const visiblePages = $derived.by(() => {
		const pages: number[] = [];
		const start = Math.max(1, page - 2);
		const end = Math.min(totalPages, page + 2);
		for (let i = start; i <= end; i++) {
			pages.push(i);
		}
		return pages;
	});

	function goTo(target: number) {
		if (target < 1 || target > totalPages || target === page) return;
		page = target;
		onPageChange?.(target);
	}
</script>

<div class={cn("flex justify-center", className)}>
	<div class="join">
		<button
			type="button"
			class="join-item btn"
			disabled={page <= 1}
			onclick={() => goTo(page - 1)}
			aria-label="Previous page"
		>
			«
		</button>

		{#each visiblePages as p (p)}
			<button
				type="button"
				class={cn("join-item btn", p === page && "btn-active")}
				onclick={() => goTo(p)}
				aria-label="Page {p}"
				aria-current={p === page ? "page" : undefined}
			>
				{p}
			</button>
		{/each}

		<button
			type="button"
			class="join-item btn"
			disabled={page >= totalPages}
			onclick={() => goTo(page + 1)}
			aria-label="Next page"
		>
			»
		</button>
	</div>
</div>