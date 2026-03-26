<script lang="ts">
    import { cn } from '@/utils/cn'
    import { createSpriteManager } from '@/utils/sprite'
    import { env } from '@/env'

    interface Props {
      className?: string,
      frame?: "idleA" | "idleB" | "idleC" | "idleD"
    }

    const { frame = "idleA", className }: Props = $props()

    const nun = createSpriteManager({
      image: `${env.VITE_API_URL}/static/nun/neutral.webp`,
      width: 352,
      height: 768,
      frames: ["idleA", "idleB", "idleC", "idleD"],
    })
</script>

<div class={cn(className, "nun absolute scale-x-[-1]")}
     style={nun.getStyles(frame)}
>
</div>