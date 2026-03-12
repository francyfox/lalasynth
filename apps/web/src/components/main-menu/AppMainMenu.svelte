<script lang="ts">
    import { authClient } from '@/lib/auth-client'
    import { cn } from '@/utils/cn'
    import { goto } from '@roxi/routify'
    import AppSettingsModal from '@/components/settings/AppSettingsModal.svelte'

    const _init = $goto;

    let settingsOpen = $state(false);


    const MenuNav = [
      {
        id: 0,
        label: 'Single Player',
        action: () => {
          $goto('/lobby')
        }
      },
      {
        id: 1,
        label: 'Multi Player',
        disabled: true,
        action: () => {
          $goto('/lobby')
        }
      },
      {
        id: 2,
        label: 'Settings',
        action: () => {
          settingsOpen = true;
        },
      }
    ]

    async function logOut() {
      await authClient.signOut()
      $goto('/auth')
    }
</script>

<div class="relative p-[3px] bg-[#c0c0c0] shadow-[1px_1px_0_rgba(0,0,0,1),-1px_-1px_0_rgba(255,255,255,1)]">
    <div class="bg-[#000080] p-1 shadow-[inset_1px_1px_0_rgba(0,0,0,1),inset_-1px_-1px_0_rgba(255,255,255,1)]">
        <nav class="flex flex-col min-w-[240px] bg-gradient-to-b from-[#000080] via-[#0000aa] to-[#000080] bg-[length:100%_4px] space-y-1 p-2">

            {#each MenuNav as i (i.id)}
                <button type="button"
                        class={cn(i.disabled ? 'opacity-50 pointer-events-none' : '', "group relative px-4 py-2 text-left")}
                        aria-label={i.label}
                        onclick={i.action}
                        disabled={i.disabled}
                >
                  <span class="relative z-10 text-[#ffffff] font-mono text-lg uppercase tracking-wider group-focus:text-[#ffff00] group-hover:text-[#ffff00]">
                    { i.label }
                  </span>
                    <span class="absolute inset-0 hidden group-hover:block group-focus:block bg-[#0000ff] border border-dotted border-white opacity-50"></span>
                </button>
            {/each}


            <div class="h-[2px] my-1 bg-gray-400 shadow-[0_1px_0_rgba(255,255,255,0.5)]"></div>

            <button
                    class="group relative px-4 py-2 text-left text-[#ffffff]"
                    onclick={logOut}
            >
              <span class="relative z-10 font-mono text-lg uppercase group-focus:text-[#ffff00] group-hover:text-[#ffff00]">
                Logout
              </span>
            </button>

        </nav>
    </div>
</div>

<AppSettingsModal bind:open={settingsOpen} />