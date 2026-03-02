<script lang="ts">
import { cn } from '@/utils/cn'
import StopImage from "@/assets/traffic/stop.webp?url"
import WaitImage from "@/assets/traffic/wait.webp?url"
import GoImage from "@/assets/traffic/go.webp?url"
import { fade } from 'svelte/transition'
import { onMount } from 'svelte'

interface Props {
  className?: string
  delay?: number
  onGo: () => void
}

const { className, delay = 1000, onGo }: Props = $props()
let currentImg = $state(StopImage)

async function* animationGenerator() {
  const frames = [StopImage, WaitImage, GoImage];
  while (true) {
    for (const frame of frames) {
      yield frame;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

onMount(() => {
  setTimeout(async () => {
    for await (const frame of animationGenerator()) {
      currentImg = frame;

      if (frame === GoImage) onGo()
    }
  }, delay)
})
</script>

<div transition:fade class={cn(className, "absolute")}>
    <img src={currentImg} alt="traffic light">
</div>