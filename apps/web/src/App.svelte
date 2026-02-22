<script lang="ts">
import { Router, createRouter } from '@roxi/routify'
import { onMount } from 'svelte'
import routes from '../.routify/routes.default.js'
export const router = createRouter({ routes })

onMount(() => {
  // toast.success("It works!");
})
</script>

<Router {router} />
