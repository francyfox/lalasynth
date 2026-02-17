<script lang="ts">
  import { animateBounceText, animateLogo } from '@/components/banner/animations'
  import ElysiaLogo from "@/assets/banner/elysia.svg?raw"
  import "@fontsource/fredoka/700.css";

  $effect(() => {
    const anims = [
      animateBounceText(".letter2"),
      animateLogo(),
    ]

    return () => {
      for (const anim of anims) {
        anim.pause()
        anim.remove(".letter2")
      }
    }
  })
</script>

<div class="banner-item flex justify-center items-center h-full w-full gap-10">
    {@html ElysiaLogo }

    <span class="letter2 drop-shadow-md text-[6vw] font-fredoka !overflow-visible">
        Elysia
    </span>
</div>

<style>
    .banner-item :global(svg) {
        width: 15vw;
        height: auto;
        filter: drop-shadow(0 0 10px rgba(170, 255, 255, 0.5));
        opacity: 0.7;
    }

    .font-fredoka {
        font-family: 'Fredoka', sans-serif;
    }

    .letter > :global(span) {
        overflow: visible !important;
    }
</style>
