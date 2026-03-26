<!-- routify:meta _auth=true -->
<script lang="ts">

    import AppBsdEgg from '@/components/eggs/AppBsdEgg.svelte'
    import AppMainMenu from '@/components/main-menu/AppMainMenu.svelte'
    import AppMenuParallax from '@/components/main-menu/AppMenuParallax.svelte'
    import { onMount } from 'svelte'
    import { fade } from 'svelte/transition'
    import { helperStore } from '@/lib/stores/helper.svelte'
    import { audioManager } from '@/lib/audio/audio-manager.svelte'
    import { env } from '@/env'

    const bgBaseUrl = `${env.VITE_API_URL}/static/bg`

    const showEggs = $state({
      bsd: false,
    });

    onMount(() => {
      audioManager.playBg('dialogue')
      setTimeout(() => {
        helperStore.show(['listen', 'fullscreen'])
      }, 500)
    })
</script>

<section class="w-full h-full bg-gray-950">
    <div class="mx-auto container h-full">
        <AppMenuParallax baseUrl={bgBaseUrl}>
            <section class="h-full">
                <div class="mx-auto container h-full relative">
                    <div class="absolute left-10 bottom-[20vh] flex flex-col gap-5">
                        {#if showEggs.bsd}
                            <div class="absolute top-[-66px]"
                                 transition:fade={{ duration: 300 }}
                            >
                                <AppBsdEgg />
                            </div>
                        {/if}

                        <div class="text-center text-4xl bg-[#c0c0c0] text-black py-1 px-2 shadow-[1px_1px_0_rgba(0,0,0,1),-1px_-1px_0_rgba(255,255,255,1)]"
                            onclick={() => showEggs.bsd = true}
                        >
                            Lalasynth
                        </div>

                        <AppMainMenu />
                    </div>
                </div>
            </section>
        </AppMenuParallax>
    </div>
</section>


<style lang="postcss">

</style>