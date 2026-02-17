<script lang="ts">
import AppBannerCreated from '@/components/banner/AppBannerCreated.svelte'
import AppBannerElysia from '@/components/banner/AppBannerElysia.svelte'
import AppBannerSvelte from '@/components/banner/AppBannerSvelte.svelte'
import AppSceneProvider from '@/components/scene/AppSceneProvider.svelte'
</script>

<div class="h-full">
    {#snippet step1()} <AppBannerCreated /> {/snippet}
    {#snippet step2()} <AppBannerElysia /> {/snippet}
    {#snippet step3()} <AppBannerSvelte /> {/snippet}

    <AppSceneProvider
            duration="{3000}"
            scenes={[step1, step2, step3]}
    />
</div>

<style></style>