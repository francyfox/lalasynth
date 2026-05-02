<script lang="ts">
  import { authStore } from '@/lib/stores/auth';
  import GithubIcon from '~icons/local/github';
  import { goto } from '@roxi/routify'

  const _init = $goto;

  async function handleSocialAuth(provider: 'github' | 'google') {
    await authStore.socialAuth(provider);
  }

  async function handleGuestLogin() {
    const success = await authStore.guestLogin();
    console.log(success);
    if (success) $goto('/menu');
  }
</script>
<div class="divider text-2xl">or</div>

<div class="space-y-2">
    <button
        onclick={handleGuestLogin}
        disabled={$authStore.isLoading}
        class="btn btn-secondary w-full text-xl gap-2"
    >
        {#if $authStore.isLoading}
            <span class="loading loading-spinner loading-sm"></span>
        {/if}
        Play as Guest
    </button>

    <button
        onclick={() => handleSocialAuth('github')}
        disabled={$authStore.isLoading}
        class="btn btn-outline w-full text-xl gap-2"
    >
        {#if $authStore.isLoading}
            <span class="loading loading-spinner loading-sm"></span>
        {:else}
            <GithubIcon class="w-5 h-5" />
        {/if}
        GitHub
    </button>
</div>