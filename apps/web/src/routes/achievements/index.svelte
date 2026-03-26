<!-- routify:meta _auth=true -->
<script lang="ts">
import { getSessionStore } from '@/lib/stores/session'
import UCode from '@package/ui/code/UCode.svelte'
import { env } from '@/env'

const API_BASE = env.VITE_API_URL

const session = getSessionStore()

const userId = $derived(session.data?.user?.id ?? '')
const badgeUrl = $derived(`${API_BASE}/user/${userId}/badge`)

const markdownSnippet = $derived(
	`[![Lalasynth WPM](${badgeUrl})](https://lalasynth.dev)`
)

const htmlSnippet = $derived(
	`<a href="https://lalasynth.dev">\n  <img src="${badgeUrl}" alt="Lalasynth WPM" />\n</a>`
)
</script>

<section class="py-10">
	<div class="mx-auto container max-w-2xl flex flex-col gap-10">

		<div>
			<h1 class="text-4xl font-light mb-1">Achievements</h1>
			<p class="text-base-content/50 text-xl">Your stats and profile badge</p>
		</div>

		{#if userId}
			<div class="flex flex-col gap-6">
				<div class="flex flex-col gap-3">
					<h2 class="text-sm font-light text-base-content/70 uppercase tracking-widest">Preview</h2>
					<div class="flex items-center gap-4 p-4 rounded-lg bg-base-200/40 border border-white/8">
						<img src={badgeUrl} alt="Your Lalasynth badge" class="h-8" />
					</div>
				</div>

				<div class="flex flex-col gap-3">
					<h2 class="text-sm font-light text-base-content/70 uppercase tracking-widest">Embed in GitHub README</h2>
					<p class="text-sm text-base-content/40">Paste this in your <code class="font-mono text-xs bg-white/8 px-1.5 py-0.5 rounded">README.md</code>:</p>
					<UCode code={markdownSnippet} lang="markdown" />
				</div>

				<div class="flex flex-col gap-3">
					<p class="text-sm text-base-content/40">Or with HTML:</p>
					<UCode code={htmlSnippet} lang="html" />
				</div>
			</div>
		{:else}
			<p class="text-base-content/40 text-sm">Loading...</p>
		{/if}

	</div>
</section>