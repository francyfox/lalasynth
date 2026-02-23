<script lang="ts">
  import { runGuards } from '@/lib/guards'
  import { beforeUrlChange, activeRoute } from '@roxi/routify';
  import { router } from '@/router'

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
<slot />