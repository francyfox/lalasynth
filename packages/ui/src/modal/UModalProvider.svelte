<script lang="ts">
	import { modalState, closeModal, confirmModal } from "./modal.svelte.ts";

	let dialog = $state<HTMLDialogElement | null>(null);
	const bodySnippet = $derived(modalState.config?.snippet);

	$effect(() => {
		if (!dialog) return;
		if (modalState.open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
</script>

<dialog
	bind:this={dialog}
	class="modal"
	onclose={() => closeModal()}
>
	<div class="modal-box relative">
		<!-- Close button -->
		<button
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			onclick={() => closeModal()}
			aria-label="Close"
		>
			✕
		</button>

		{#if modalState.config}
			{#if modalState.config.title}
				<h3 class="font-bold text-lg mb-2">{modalState.config.title}</h3>
			{/if}
			{#if bodySnippet}
				<div class="py-4">{@render bodySnippet()}</div>
			{:else if modalState.config.body}
				<p class="py-4">{modalState.config.body}</p>
			{/if}

			<div class="modal-action">
				{#if modalState.config.cancelText}
					<button
						class="btn btn-ghost"
						onclick={() => closeModal()}
						disabled={modalState.loading}
					>
						{modalState.config.cancelText}
					</button>
				{/if}
				<button
					class="btn btn-primary"
					onclick={() => confirmModal()}
					disabled={modalState.loading}
				>
					{#if modalState.loading}
						<span class="loading loading-spinner loading-sm"></span>
					{/if}
					{modalState.config.confirmText ?? "OK"}
				</button>
			</div>
		{/if}
	</div>

	<!-- Backdrop click to close -->
	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>