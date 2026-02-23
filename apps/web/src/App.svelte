<script lang="ts">
import { Toaster, toast } from 'svelte-sonner'
import { Router, createRouter } from '@roxi/routify'
import { onMount } from 'svelte'
import routes from '../.routify/routes.default.js'
export const router = createRouter({ routes })

onMount(() => {
  toast('test')
})
</script>

<Router {router} />
<Toaster />

