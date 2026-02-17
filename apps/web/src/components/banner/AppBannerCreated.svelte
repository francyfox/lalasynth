<script lang="ts">
  import { animateBounceText } from '@/components/banner/animations'
  import { remove } from 'animejs'
  import { onDestroy, onMount } from 'svelte'


  onMount(() => {
    animateBounceText(".letter")
  })

  onDestroy(() => {
    remove('.letter');
  });
</script>

<div class="banner-item flex justify-center items-center h-full w-full gap-10">
    <span class="letter drop-shadow-md text-[6vw]">
        Created on
    </span>
</div>

<style>
</style>
