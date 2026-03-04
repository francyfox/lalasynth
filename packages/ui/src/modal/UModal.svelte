<script lang="ts">
	import type { Snippet } from "svelte";
	import { cn } from '../utils.ts'

	interface Props {
		open?: boolean;
		title?: string;
		confirmText?: string;
		cancelText?: string;
		loading?: boolean;
		onConfirm?: () => void | Promise<void>;
		onCancel?: () => void;
		children?: Snippet;
		className?: string;
	}

	let {
		open = $bindable(false),
		title,
		confirmText,
		cancelText,
		loading = false,
		onConfirm,
		onCancel,
		children,
		className,
	}: Props = $props();

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (open) dialog.showModal();
		else dialog.close();
	});

	function handleClose() {
		open = false;
		onCancel?.();
	}

	async function handleConfirm() {
		await onConfirm?.();
		open = false;
	}
</script>

<dialog
		bind:this={dialog}
		class={cn(className, "modal")}
		onclose={handleClose}
>
	<div class="modal-box w-11/12 max-w-3xl relative">
		<button
			class="btn btn-md btn-circle btn-ghost text-xl absolute right-2 top-2"
			onclick={handleClose}
			aria-label="Close"
		>
			✕
		</button>

		{#if title}
			<h3 class="font-bold text-2xl mb-4">{title}</h3>
		{/if}

		{#if children}
			{@render children()}
		{/if}

		{#if confirmText || cancelText}
			<div class="modal-action">
				{#if cancelText}
					<button class="btn btn-ghost text-xl" onclick={handleClose} disabled={loading}>
						{cancelText}
					</button>
				{/if}
				{#if confirmText}
					<button class="btn btn-primary text-xl" onclick={handleConfirm} disabled={loading}>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						{confirmText}
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>