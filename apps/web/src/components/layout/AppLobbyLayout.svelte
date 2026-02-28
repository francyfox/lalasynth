<script lang="ts">
  import type { UIType } from '@/components/layout/game.layout.types'
  import { client } from '@/lib/api'
  import { authClient } from '@/lib/auth-client'
  import { getSessionMutations, getSessionStore } from '@/lib/stores/session'
  import { getScenesStore } from '@/lib/stores/scenes'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'
  import { goto } from '@roxi/routify'
  import { onMount } from 'svelte'

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
    if (sessionStore.data?.user.level === 1) {
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


