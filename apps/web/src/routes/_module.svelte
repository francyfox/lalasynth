<script lang="ts">
  import { runGuards } from '@/lib/guards'
  import { getSystemStats } from '@/lib/stores/stats'
  import UStats from '@package/ui/stats/UStats.svelte'
  import { beforeUrlChange, activeRoute } from '@roxi/routify';
  import { router } from '@/router'
  import ProgressBar from '@roxi/routify/components/ProgressBar.svelte';
  import { fade } from 'svelte/transition';

  const stats = getSystemStats()
  let isAllowed = $state(false);
  let showStats: boolean = $state(true);
  async function performCheck(currentRoute: Route) {
    const canContinue = await runGuards({ route: currentRoute, router: $router });
    if (canContinue) {
      isAllowed = true;
    }
  }

  function toggleStats() {
	  showStats = !showStats
	  console.log(showStats)
  }

  performCheck($activeRoute);

  $beforeUrlChange(async (event) => {
    return runGuards(event)
  });
</script>

<ProgressBar />

<UStats
	{...stats.data}
	className={showStats ? '' : 'hidden'}
	onShortcut="{toggleStats}"
/>


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