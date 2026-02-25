<script lang="ts">
  import { authClient } from '@/lib/auth-client'
  import { getSessionStore } from '@/lib/stores/session'
  import { getScenesStore } from '@/lib/stores/scenes'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'
  import { goto } from '@roxi/routify'

  const _init = $goto;
  const sessionStore = getSessionStore();
  const scenesStore = getScenesStore();

  let currentSceneId = $state(0);

  const currentScene = $derived(scenesStore.getSceneById(currentSceneId));
  const bgImage = $derived.by(() => `background: url(${currentScene?.bg}) center center/cover`);
  const formattedMessage = $derived.by(() => currentScene?.message?.replace('$user', sessionStore.data?.user.name || '') || '')

  async function logOut() {
    await authClient.signOut()
    $goto('/auth')
  }

  function next() {
    currentSceneId += 1;
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
        <USceneDialogue
                message={formattedMessage}
                {next}
        />
    </main>
</div>


