<script lang="ts">
  import { animateBounceText } from '@/components/banner/animations'
  import SvelteLogo from "@/assets/banner/svelte.svg?raw"

  $effect(() => {
    const anim = animateBounceText(".letter");

    return () => {
      anim.pause()
      anim.remove(".letter")
    }
  })
</script>

<div class="banner-item flex justify-center items-center h-full w-full gap-10">
    {@html SvelteLogo }

    <span class="letter drop-shadow-md text-[6vw]">
        Svelte
    </span>
</div>

<style>
    .banner-item :global(svg) {
        width: 10vw;
        height: auto;
        filter: drop-shadow(0 0 10px rgba(170, 255, 255, 0.5));
        opacity: 0.7;
    }

</style>
