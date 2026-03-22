<script lang="ts">
  import { runGuards } from '@/lib/guards'
  import { getSystemStats } from '@/lib/stores/stats'
  import { settingsStore } from '@/lib/stores/settings.svelte'
  import UStats from '@package/ui/stats/UStats.svelte'
  import { useKeyboardShortcut } from '@package/ui/use-keyboard-shortcut'
  import { beforeUrlChange, activeRoute } from '@roxi/routify';
  import { router } from '@/router'
  import ProgressBar from '@roxi/routify/components/ProgressBar.svelte';
  import { fade } from 'svelte/transition';

  const stats = getSystemStats(() => settingsStore.showStats);

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useKeyboardShortcut(["⌘", "Shift", "S"], () => {
    settingsStore.showStats = !settingsStore.showStats;
  }, { toast: () => settingsStore.showStats ? "Stats visible" : "Stats hidden" });

  useKeyboardShortcut(["⌘", "M"], () => {
    settingsStore.sound = !settingsStore.sound;
  }, { toast: () => settingsStore.sound ? "Sound ON" : "Sound OFF" });

  useKeyboardShortcut(["]"], () => {
    settingsStore.volume = Math.min(100, settingsStore.volume + 10);
  }, { toast: () => `Volume: ${settingsStore.volume}%` });

  useKeyboardShortcut(["["], () => {
    settingsStore.volume = Math.max(0, settingsStore.volume - 10);
  }, { toast: () => `Volume: ${settingsStore.volume}%` });

  async function performCheck(currentRoute: Route) {
    const canContinue = await runGuards({ route: currentRoute, router: $router });
  }

  performCheck($activeRoute);

  $beforeUrlChange(async (event) => {
    return runGuards(event)
  });
</script>

<ProgressBar />

{#if settingsStore.showStats && stats.data}
  <UStats {...stats.data} className="!fixed" />
{/if}

{#key $activeRoute.url}
	<div transition:fade={{ duration: 300 }} class="page-transition h-full">
		<slot />
	</div>
{/key}

<style>
	.page-transition {
		animation: fadeIn 0.3s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>