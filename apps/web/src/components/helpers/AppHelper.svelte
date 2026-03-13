<script lang="ts">
	import { UModal } from "@package/ui/index.js";
	import { Fullscreen, Headphones, ShieldAlert, ShieldCheck } from "lucide-svelte";
	import { helperStore } from "@/lib/stores/helper.svelte";
	import { settingsStore } from "@/lib/stores/settings.svelte";

	function disableHints() {
		settingsStore.hints = false;
		helperStore.close();
	}
</script>

<UModal open={helperStore.open && settingsStore.hints} onCancel={() => helperStore.close()}>
	{#if helperStore.current === "listen"}
		<div class="flex flex-col items-center gap-5 py-4 text-center">
			<Headphones class="size-20 text-primary" />
			<p class="text-2xl">
				Use headphones for the best experience. This app uses audio — make sure browser access is allowed.
			</p>

			{#if helperStore.audioStatus === "checking"}
				<div class="flex items-center gap-2 text-base-content/50">
					<span class="loading loading-spinner loading-sm"></span>
					<span class="text-sm">Checking audio…</span>
				</div>
			{:else if helperStore.audioStatus === "allowed"}
				<div class="flex items-center gap-2 text-success">
					<ShieldCheck class="size-5" />
					<span class="text-sm">Audio playback is allowed</span>
				</div>
			{:else if helperStore.audioStatus === "blocked"}
				<div class="alert alert-error text-left">
					<ShieldAlert class="size-5 shrink-0" />
					<div>
						<p class="font-semibold text-sm">Autoplay is blocked</p>
						<p class="text-xs opacity-80">Click anywhere on the page first, or allow autoplay in your browser settings.</p>
					</div>
					<button class="btn btn-xs btn-ghost ml-auto" onclick={() => helperStore.retryAudio()}>Retry</button>
				</div>
			{/if}
		</div>
	{:else if helperStore.current === "fullscreen"}
		<div class="flex flex-col items-center gap-5 py-4 text-center">
			<Fullscreen class="size-20 text-primary" />
			<p class="text-2xl">
				For the best experience, switch to fullscreen mode.
			</p>
			<button
				class="btn btn-primary btn-md text-xl gap-2"
				onclick={() => document.documentElement.requestFullscreen()}
			>
				<Fullscreen class="size-4" />
				Enter fullscreen
			</button>
		</div>
	{/if}

	<div class="modal-action justify-between w-full mt-4">
		<button class="btn btn-ghost btn-md text-base-content/40" onclick={disableHints}>
			Don't show hints
		</button>

		<div class="flex items-center gap-2">
			{#if helperStore.total > 1}
				<span class="px-5 text-base-content/40 text-sm">
					{helperStore.step} / {helperStore.total}
				</span>
			{/if}
			<button class="btn btn-ghost text-xl" onclick={() => helperStore.close()}>Skip</button>
			<button class="btn btn-primary text-xl" onclick={() => helperStore.next()}>
				{helperStore.hasNext ? "Next →" : "Got it"}
			</button>
		</div>
	</div>
</UModal>