<script lang="ts">
    import { cn } from '@/utils/cn'
    import { createSpriteManager } from '@/utils/sprite'

    interface Props {
      className?: string,
      frame?: "idleA" | "idleB" | "idleC" | "idleD"
    }

    const { frame = "idleA", className }: Props = $props()

    const nun = createSpriteManager({
      image: 'http://localhost:3000/static/nun/neutral.webp',
      width: 352,
      height: 768,
      frames: ["idleA", "idleB", "idleC", "idleD"],
    })
</script>

<div class={cn(className, "nun absolute scale-x-[-1]")}
     style={nun.getStyles(frame)}
>
</div>