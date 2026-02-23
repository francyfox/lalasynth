<script lang="ts">
import { Toaster, type ToastOptions } from 'svelte-sonner'
import { Router, createRouter } from '@roxi/routify'
import routes from '../.routify/routes.default.js'
export const router = createRouter({ routes })

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

<Router {router} />
<Toaster
        {toastOptions}
        position="top-center"
        visibleToasts={2}
/>

