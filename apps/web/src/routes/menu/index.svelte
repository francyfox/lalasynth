<!-- routify:meta _auth=true -->
<script lang="ts">

    import AppBsdEgg from '@/components/eggs/AppBsdEgg.svelte'
    import AppMainMenu from '@/components/main-menu/AppMainMenu.svelte'
    import AppMenuParallax from '@/components/main-menu/AppMenuParallax.svelte'
    import { fade } from 'svelte/transition'

    const bgBaseUrl = "http://localhost:3000/static/bg"

    const showEggs = $state({
      bsd: false,
    });
</script>

<AppMenuParallax baseUrl={bgBaseUrl}>
    <section class="h-full">
        <div class="mx-auto container relative">
            <div class="fixed bottom-[20vh] flex flex-col gap-5">
                {#if showEggs.bsd}
                    <div class="absolute top-[-66px]"
                         transition:fade={{ duration: 300 }}
                    >
                        <AppBsdEgg />
                    </div>
                {/if}

                <h1 class="text-center text-4xl bg-[#c0c0c0] text-black py-1 px-2 shadow-[1px_1px_0_rgba(0,0,0,1),-1px_-1px_0_rgba(255,255,255,1)]"
                    onclick={() => showEggs.bsd = true}
                >
                    Lalasynth
                </h1>

                <AppMainMenu />
            </div>
        </div>
    </section>
</AppMenuParallax>

<style lang="postcss">
</style>