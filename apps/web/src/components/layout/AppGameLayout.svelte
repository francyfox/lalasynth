<script lang="ts">
  import { authClient } from '@/lib/auth-client'
  import { getSessionStore } from '@/lib/stores/session'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'
  import { goto } from '@roxi/routify'

  const _init = $goto;
  const sessionStore = getSessionStore()

  async function logOut() {
    await authClient.signOut()
    $goto('/auth')
  }
</script>

<div class="wrap h-[calc(100vh_-_20%)]">
    <UNavbar
            user={sessionStore.data?.user}
            hasSound={false}
            {noAvatar}
            github="https://github.com/francyfox/lalasynth"
            onSound="{() => ''}"
            {logOut}
    />
    <main class="flex flex-col mx-10 my-2">
        <slot />
        <USceneDialogue message="Lorem Ipsum is simply dummy text of"/>
    </main>
</div>


