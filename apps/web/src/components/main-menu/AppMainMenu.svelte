<script lang="ts">
    import AppCredits from '@/components/credits/AppCredits.svelte'
    import { authClient } from '@/lib/auth-client'
    import { getSessionStore } from '@/lib/stores/session'
    import { goto } from '@roxi/routify'
    import AppSettingsModal from '@/components/settings/AppSettingsModal.svelte'
    import UModal from '@package/ui/modal/UModal.svelte'
    import UMMButton from '@package/ui/mm-button/UMMButton.svelte'
    import { gameStore } from '@/lib/stores/game.svelte'
    import { activeServer } from '@/lib/stores/active-server.svelte'

    const _init = $goto;

    const sessionStore = getSessionStore();
    let settingsOpen = $state(false);
    let creditsOpen = $state(false);

    const MenuNav = [
      {
        label: 'Single Player',
        action: () => {
          gameStore.mode = "single"
          $goto('/lobby')
        }
      },
      {
        label: 'Multi Player',
        disabled: true,
        action: () => {
          gameStore.mode = "multiplayer"
          $goto('/lobby')
        }
      },
      {
        label: 'Master List',
        action: () => {
          activeServer.clear()
          $goto('/servers')
        }
      },
      {
        label: 'Achievements',
        action: () => {
          $goto('/achievements')
        }
      },
      {
        label: 'Settings',
        action: () => {
          settingsOpen = true;
        },
      },
      {
        label: 'Credits',
        action: () => {
          creditsOpen = true;
        },
      }
    ].map((i, index) => {
      return { id: index, ...i}
    })

    async function logOut() {
      await authClient.signOut()
      $goto('/auth')
    }
</script>

<div class="relative p-[3px] bg-[#c0c0c0] shadow-[1px_1px_0_rgba(0,0,0,1),-1px_-1px_0_rgba(255,255,255,1)]">
    <div class="bg-[#000080] p-1 shadow-[inset_1px_1px_0_rgba(0,0,0,1),inset_-1px_-1px_0_rgba(255,255,255,1)]">
        <nav class="flex flex-col min-w-[240px] bg-gradient-to-b from-[#000080] via-[#0000aa] to-[#000080] bg-[length:100%_4px] space-y-1 p-2">

            {#each MenuNav as i (i.id)}
                <UMMButton label={i.label} onclick={i.action} disabled={i.disabled} />
            {/each}

            <div class="h-[2px] my-1 bg-gray-400 shadow-[0_1px_0_rgba(255,255,255,0.5)]"></div>

            <UMMButton label={sessionStore.data?.user.name ?? ''} disabled />
            <UMMButton label="Logout" onclick={logOut} />

        </nav>
    </div>
</div>

<AppSettingsModal bind:open={settingsOpen} />

<UModal bind:open={creditsOpen} title="Credits">
    <AppCredits />
</UModal>