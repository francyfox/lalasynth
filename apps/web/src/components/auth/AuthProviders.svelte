<script lang="ts">
  import { authStore } from '@/lib/stores/auth';
  import { Github } from 'lucide-svelte';

  async function handleSocialAuth(provider: 'github' | 'google') {
    await authStore.socialAuth(provider);
  }
</script>
<div class="divider text-2xl">or</div>

<div class="space-y-2">
    <button
        on:click={() => handleSocialAuth('github')}
        disabled={$authStore.isLoading}
        class="btn btn-outline w-full text-xl gap-2"
    >
        {#if $authStore.isLoading}
            <span class="loading loading-spinner loading-sm"></span>
        {:else}
            <Github class="w-5 h-5" />
        {/if}
        GitHub
    </button>
</div>