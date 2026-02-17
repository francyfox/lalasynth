<script lang="ts">
import AppBanner from '@/components/banner/AppBanner.svelte'
import { Router, createRouter } from '@roxi/routify'
import routes from '../.routify/routes.default.js'

export const router = createRouter({ routes })
</script>

<Router {router} />
