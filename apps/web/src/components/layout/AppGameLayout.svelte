<script lang="ts">
  import { getSessionStore } from '@/lib/stores/session'
  import { UNavbar } from '@package/ui/index.js'
  import USceneDialogue from '@package/ui/scene-dialogue/USceneDialogue.svelte'
  import noAvatar from '@/assets/noavatar.gif?inline'

  const sessionStore = getSessionStore()
</script>

<div class="wrap h-[calc(100vh_-_20%)]">
    <UNavbar
            user={sessionStore.data?.user}
            hasSound={false}
            {noAvatar}
    />
    <main class="flex flex-col mx-10 my-2">
        <slot />
        <USceneDialogue message="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."/>
    </main>
</div>


