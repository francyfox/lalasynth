<script lang="ts">
    import { Github, Volume2, Volume, LogOut } from 'lucide-svelte';
    const {
      user,
      noAvatar,
      github,
      exit,
      hasSound,
      onSound,
    } = $props<{
      user?: {
        name: string
        image?: string | null | undefined;
      }
      noAvatar: string
      github: string
      hasSound: boolean
      exit: () => void
      onSound: () => void
    }>();

    const userImage = $derived.by(() => {
      if (user?.image) return user?.image;
      return noAvatar;
    })

    const version = import.meta.env.VITE_APP_VERSION || '';
</script>

<div class="navbar bg-base-200/90 shadow-sm px-10 z-20">
    <div class="flex-1 flex gap-2 items-center">
        <a href={github} target="_blank" class="btn btn-neutral btn-xl" aria-label="github" title="github">
            <Github class="size-10" />
        </a>
        <h1 class="text-3xl">LalaSynth {version}</h1>
    </div>
    <div class="flex gap-2 items-center text-3xl">
        <div class="inline-flex gap-2">
            user: ${ user?.name }
        </div>
        <div class="w-15 rounded-full overflow-hidden">
            <img
                    alt="user logo"
                    src="{userImage}" />
        </div>

        <button
                type="button"
                class="btn btn-xl {hasSound ? 'btn-neutral  ' : 'btn-error'}"
                aria-label="Enable Sound"
                title="Enable Sound"
                onclick={onSound}
        >
            {#if hasSound}
                <Volume2 class="size-10" />
            {:else}
                <Volume class="size-10" />
            {/if}
        </button>

        <button
                type="button"
                class="btn btn-neutral btn-xl"
                aria-label="menu"
                title="menu"
                onclick={exit}
        >
            <LogOut class="size-10" />
        </button>
    </div>
</div>