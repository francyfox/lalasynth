<script lang="ts">
  import { runGuards } from '@/lib/guards'
  import { beforeUrlChange, activeRoute } from '@roxi/routify';
  import { router } from '@/router'
  import ProgressBar from '@roxi/routify/components/ProgressBar.svelte';
  import { fade } from 'svelte/transition';
  import Nav from '@roxi/routify/components/Nav.svelte';

  let isAllowed = $state(false);
  async function performCheck(currentRoute: Route) {
    const canContinue = await runGuards({ route: currentRoute, router: $router });
    if (canContinue) {
      isAllowed = true;
    }
  }

  performCheck($activeRoute);

  $beforeUrlChange(async (event) => {
    return runGuards(event)
  });
</script>

<ProgressBar />

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