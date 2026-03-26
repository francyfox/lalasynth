<script lang="ts">
import { runGuards } from '@/lib/guards'
import { queryClient } from '@/lib/query-client'
import { router } from '@/router'
import UModalProvider from '@package/ui/modal/UModalProvider.svelte'
import AppHelper from '@/components/helpers/AppHelper.svelte'
import { Toaster, type ToastOptions } from 'svelte-sonner'
import { Router } from '@roxi/routify'
import { QueryClientProvider } from '@tanstack/svelte-query'
import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools'
import { settingsStore } from '@/lib/stores/settings.svelte'
import { env } from '@/env'

$effect(() => {
	const res = settingsStore.resolution;

	if (res === 'native') {
		document.body.style.transform = '';
		document.body.style.width = '';
		document.body.style.height = '';
        document.documentElement.style.backgroundImage = ""
        document.documentElement.style.backgroundRepeat = "";
        document.documentElement.style.backgroundSize = "";
        document.documentElement.style.backgroundPosition = "";
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
    document.documentElement.style.backgroundImage = `url('${env.VITE_API_URL}/static/16bit.webp')`
    document.documentElement.style.backgroundRepeat = "no-repeat";
    document.documentElement.style.backgroundSize = "contain";
    document.documentElement.style.backgroundPosition = "center center";
});

const toastOptions: ToastOptions = {
	duration: 2200,
	classes: {
		toast: 'alert shadow-lg font-[Fredoka] text-[20px]',
		success: 'alert-success',
		error: 'alert-error',
		info: 'alert-info',
		warning: 'alert-warning',
		title: 'font-semibold',
		description: 'text-md opacity-80',
		closeButton: 'btn btn-ghost btn-xs',
	},
}
</script>

<QueryClientProvider client={queryClient}>
    <UModalProvider />
    <AppHelper />
    <Router {router} beforeUrlChange={runGuards} />
    <Toaster
            {toastOptions}
            position="top-center"
            visibleToasts={2}
            unstyled
    />
    <SvelteQueryDevtools />
</QueryClientProvider>


