<script lang="ts">
	import { settingsStore } from "@/lib/stores/settings.svelte";
	import type { Resolution } from "@/lib/stores/settings.svelte";
	import SettingRow from "./SettingRow.svelte";
	let { open = $bindable(false) }: { open?: boolean } = $props();

	let dialog = $state<HTMLDialogElement | undefined>(undefined);

	const nativeResolution =
		typeof window !== "undefined"
			? `${window.screen.width}x${window.screen.height}`
			: "1920x1080";

	const [nativeW, nativeH] = nativeResolution.split("x").map(Number);

	const ALL_RESOLUTIONS = ["1920x1080", "1280x720", "1024x768", "800x600", "640x400"] as const;

	const resolutions: { value: Resolution; label: string }[] = [
		{ value: "native", label: `Native (${nativeResolution})` },
		...ALL_RESOLUTIONS.filter((r) => {
			const [w, h] = r.split("x").map(Number);
			return w < nativeW || h < nativeH;
		}).map((r) => ({ value: r as Resolution, label: r })),
	];

	$effect(() => {
		if (!dialog) return;
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function handleClose() {
		open = false;
	}
</script>

<dialog
	bind:this={dialog}
	class="modal"
	onclose={handleClose}
>
	<div class="modal-box relative max-w-md">
		<button
			class="btn btn-sm btn-ghost btn-circle absolute right-3 top-3"
			onclick={() => (open = false)}
		>
			✕
		</button>

		<h3 class="font-bold text-2xl mb-4">Settings</h3>

		<div class="divide-y divide-base-300">
			<SettingRow label="Resolution" description="Display resolution for the game">
				<select
					class="select select-bordered select-md"
					bind:value={settingsStore.resolution}
				>
					{#each resolutions as res (res.value)}
						<option value={res.value}>{res.label}</option>
					{/each}
				</select>
			</SettingRow>

			<SettingRow label="Sound" description="Enable or disable game audio (M)">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={settingsStore.sound}
				/>
			</SettingRow>

			<SettingRow label="Volume" description="Master volume level ([ or ])">
				<div class="flex items-center gap-2">
					<input
						type="range"
						class="range range-primary range-md w-32"
						min="0"
						max="100"
						step="1"
						bind:value={settingsStore.volume}
					/>
					<span class="text-xl w-8 text-right">{settingsStore.volume}</span>
				</div>
			</SettingRow>

			<SettingRow label="uWu mode" description="Enable uWu text mode">
				<input
					type="checkbox"
					class="toggle toggle-secondary"
					bind:checked={settingsStore.uwu}
				/>
			</SettingRow>

			<SettingRow label="Hints" description="Show gameplay hints and tips">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={settingsStore.hints}
				/>
			</SettingRow>

			<SettingRow label="Show Stats" description="Display performance stats overlay (⌘+Shift+S)">
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={settingsStore.showStats}
				/>
			</SettingRow>
		</div>

		<div class="modal-action">
			<button class="btn btn-primary text-xl" onclick={() => (open = false)}>Apply</button>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
