<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { UIType } from '@/components/layout/game.layout.types'
  import AppNun from '@/components/nun/AppNun.svelte'
  import { authClient } from '@/lib/auth-client'
  import { getSessionMutations, getSessionStore } from '@/lib/stores/session'
  import { getScenesStore } from '@/lib/stores/scenes'
  import { settingsStore } from '@/lib/stores/settings.svelte'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'
  import { goto } from '@roxi/routify'
  import { env } from '@/env'

  const _init = $goto;
  const sessionStore = getSessionStore();
  const sessionMutations = getSessionMutations();
  const scenesStore = getScenesStore();

  let { currentMode = $bindable('dialogue'), noiseLevel = 0, children }: {
    currentMode: UIType
    noiseLevel?: number
    children?: Snippet
  } = $props();

  const API_BASE = env.VITE_API_URL
  const noiseOpacity = $derived((noiseLevel / 5) * 0.55)

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
  async function exit() {
    $goto('/menu')
  }

  function next() {
    currentSceneId += 1;

    if (currentSceneId >= 3) {
      sessionMutations.updateLevel(1);
      currentMode = 'lobby'
    }
  }

  function changeSound() {
    settingsStore.sound = !settingsStore.sound
  }
</script>

{#if currentMode === 'dialogue'}
    <AppNun
            frame={currentScene?.frame || 'idleA'}
            className="z-10 bottom-[0] right-[30vw]"
    />
{/if}

<div class="wrap h-[calc(100vh_-_20%)]">
    {#if currentMode === 'game'}
        <div class="z-[1] top-0 left-0 absolute flex w-full h-full bg-[radial-gradient(circle,_transparent_10%,_oklch(0%_0_0_/_1)_100%)]"></div>
    {/if}
    <div
            class="absolute w-full h-full z-0"
            style="{bgImage}"
    >
    </div>
    <div
            class="absolute w-full h-full z-[1] pointer-events-none transition-opacity duration-300"
            style="background-image: url('{API_BASE}/static/bg/noise.gif'); background-size: 400px 400px; opacity: {noiseOpacity};"
    ></div>
    <UNavbar
            user={sessionStore.data?.user}
            bind:hasSound={settingsStore.sound}
            {noAvatar}
            github="https://github.com/francyfox/lalasynth"
            {exit}
    />

    <main class="relative flex flex-col mx-10 my-2 z-10">
        {#if currentMode === 'lobby' || currentMode === 'game'}
            {@render children?.()}
        {/if}

        {#if currentMode === 'dialogue'}
            <USceneDialogue
                    message={formattedMessage}
                    {next}
            />
        {/if}
    </main>
</div>


