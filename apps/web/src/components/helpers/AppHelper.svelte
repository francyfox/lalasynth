<script lang="ts">
    import { UModal } from '@package/ui/index.js'

    interface Props {
      type: "listen" | "fullscreen"
    }

    const { type }: Props = $props()

    let show = $state<boolean>(false)
</script>

<UModal bind:open={show}
        title={type}
>
    {#if type === "listen"}
        <div class="flex flex-col gap-5">

        </div>
    {/if}
</UModal>