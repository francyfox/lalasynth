<script lang="ts">
  import { runGuards } from '@/lib/guards'
  import { beforeUrlChange, activeRoute } from '@roxi/routify';
  import { router } from '@/router'
  import ProgressBar from '@roxi/routify/components/ProgressBar.svelte';
  import Carousel from '@roxi/routify/components/Carousel.svelte';

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
<slot/>