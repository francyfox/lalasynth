<script lang="ts">
import FightAnimImg from "@/assets/eggs/fight_anim.webp?url"
import { cn } from '@/utils/cn'

interface Props {
  className?: string
}

const { className }: Props = $props()
</script>

<img width="120"
     height="60"
     src={FightAnimImg}
     alt="bsd-egg"
     class={cn(className)}
/>

