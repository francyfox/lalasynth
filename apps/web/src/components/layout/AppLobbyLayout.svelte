<script lang="ts">
  import type { UIType } from '@/components/layout/game.layout.types'
  import { authClient } from '@/lib/auth-client'
  import { getSessionMutations, getSessionStore } from '@/lib/stores/session'
  import { getScenesStore } from '@/lib/stores/scenes'
  import { cn } from '@/utils/cn'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'
  import { goto } from '@roxi/routify'

  const _init = $goto;
  const sessionStore = getSessionStore();
  const sessionMutations = getSessionMutations();
  const scenesStore = getScenesStore();

  let { currentMode = $bindable('dialogue') }: {
    currentMode: UIType
  } = $props();

  let currentSceneId = $state(0);
  const currentScene = $derived(scenesStore.getSceneById(currentSceneId));
  const bgImage = $derived.by(() => `background: url(${currentScene?.bg}) center center/cover`);
  const formattedMessage = $derived.by(() => currentScene?.message?.replace('$user', sessionStore.data?.user.name || '') || '')

  $effect(() => {
    if (currentMode === 'game') {
      currentSceneId = 4
    } else if (sessionStore.data?.user.level === 1) {
      currentMode = 'lobby'
    }
  })
  async function logOut() {
    await authClient.signOut()
    $goto('/auth')
  }

  function next() {
    currentSceneId += 1;

    if (currentSceneId >= 3) {
      sessionMutations.updateLevel(1);
      currentMode = 'lobby'
    }
  }
</script>

<div class="wrap h-[calc(100vh_-_20%)]">
    {#if currentMode === 'game'}
        <div class="z-[1] top-0 left-0 absolute flex w-full h-full bg-[radial-gradient(circle,_transparent_10%,_oklch(0%_0_0_/_1)_100%)]"></div>
    {/if}
    <div
            class="absolute w-full h-full z-0"
            style="{bgImage}"
    >
    </div>
    <UNavbar
            user={sessionStore.data?.user}
            hasSound={false}
            {noAvatar}
            github="https://github.com/francyfox/lalasynth"
            onSound="{() => ''}"
            {logOut}
    />
    <main class="relative flex flex-col mx-10 my-2 z-10">
        <slot />

        {#if currentMode === 'dialogue'}
            <USceneDialogue
                    message={formattedMessage}
                    {next}
            />
        {/if}
    </main>
</div>


