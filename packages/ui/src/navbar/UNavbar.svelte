<script lang="ts">
    const {
      user,
      noAvatar,
      github,
      logOut,
      hasSound,
      onSound,
    } = $props<{
      user?: {
        name: string
        image: string
      }
      noAvatar: string
      github: string
      hasSound: boolean
      logOut: () => void
      onSound: () => void
    }>();

    const userImage = $derived.by(() => {
      if (user?.image) return user?.image;
      return noAvatar;
    })
</script>

<div class="navbar bg-base-200 shadow-sm px-10">
    <div class="flex-1 flex gap-2 items-center">
        <a href={github} type="button" class="btn btn-neutral btn-xl" aria-label="github" title="github">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github-icon lucide-github size-10"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </a>
        <h1 class="text-3xl">LalaSynth</h1>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2 size-10"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-icon lucide-volume size-10"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/></svg>
            {/if}
        </button>

        <button
                type="button"
                class="btn btn-neutral btn-xl"
                aria-label="logout"
                title="Logout"
                onclick={logOut}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out-icon lucide-log-out size-10"><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
        </button>
    </div>
</div>