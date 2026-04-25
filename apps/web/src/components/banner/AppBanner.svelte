<script lang="ts">
import AppBannerCreated from '@/components/banner/AppBannerCreated.svelte'
import AppBannerElysia from '@/components/banner/AppBannerElysia.svelte'
import AppBannerSvelte from '@/components/banner/AppBannerSvelte.svelte'
import AppSceneProvider from '@/components/scene/AppSceneProvider.svelte'
import { goto } from '@roxi/routify'
import { on } from 'svelte/events'

const _init = $goto;
function afterBanner() {
  $goto('/auth')
}

$effect(() => {
  return on(window, 'keydown', (e) => {
    if (e.key === 'Enter') $goto('/auth')
  })
})
</script>

<div class="h-full">
    {#snippet step1()} <AppBannerCreated /> {/snippet}
    {#snippet step2()} <AppBannerElysia /> {/snippet}
    {#snippet step3()} <AppBannerSvelte /> {/snippet}

    <AppSceneProvider
            duration={2000}
            scenes={[step1, step2, step3]}
            after={afterBanner}
    />

    <p class="fixed bottom-20 left-[50%] translate-x-[-50%] text-2xl text-warning font-mono">
        Press <span class="kbd kbd-xl">Enter</span> to continue
    </p>
</div>