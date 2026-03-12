<script lang="ts">
import { runGuards } from '@/lib/guards'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'
import UModalProvider from '@package/ui/modal/UModalProvider.svelte'
import { Toaster, type ToastOptions } from 'svelte-sonner'
import { Router } from '@roxi/routify'
import { QueryClientProvider, QueryClient } from '@tanstack/svelte-query'
import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
import { settingsStore } from '@/lib/stores/settings.svelte'

$effect(() => {
	const res = settingsStore.resolution;

	if (res === 'native') {
		document.body.style.transform = '';
		document.body.style.width = '';
		document.body.style.height = '';
		return;
	}

	const [targetW, targetH] = res.split('x').map(Number);
	const scaleX = window.innerWidth / targetW;
	const scaleY = window.innerHeight / targetH;
	const scale = Math.min(scaleX, scaleY);

	document.body.style.transformOrigin = 'top left';
	document.body.style.transform = `scale(${1 / scale})`;
	document.body.style.width = `${targetW}px`;
	document.body.style.height = `${targetH}px`;
});

const toastOptions: ToastOptions = {
  duration: 2200,
  style: `
        background-color: var(--color-neutral);
        color: var(--fallback-bc, oklch(var(--bc)));
        border: 1px solid oklch(var(--b3));
        border-radius: var(--rounded-box, 0.5rem);
        padding: 16px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        font-size: 20px;
        font-family: 'Fredoka', sans-serif;
      `,
  classes: {
    success: 'dracula-success',
    error: 'dracula-error',
    info: 'dracula-info',
    warning: 'dracula-warning'
  }
}
</script>

<QueryClientProvider client={queryClient}>
    <UModalProvider />
    <Router {router} beforeUrlChange={runGuards} />
    <Toaster
            {toastOptions}
            position="top-center"
            visibleToasts={2}
    />
    <SvelteQueryDevtools />
</QueryClientProvider>


