<script lang="ts">
	import { authStore } from '@/lib/stores/auth'
	import UInput from '@package/ui/input/UInput.svelte';
	import type { LoginFormData } from '@/lib/schemas/auth';

	let form: LoginFormData = {
		email: '',
		password: '',
	};
	export let onSubmit: (form: LoginFormData) => void;
	export let isLoading: boolean = false;

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		await onSubmit(form);
	}
</script>

<form on:submit={handleSubmit} class="space-y-4">
	<UInput
		type="email"
		id="login-email"
		bind:value={form.email}
		disabled={isLoading}
	/>
	<UInput
		type="password"
		id="login-password"
		bind:value={form.password}
		disabled={isLoading}
	/>
	<button
		type="submit"
		class="btn btn-primary w-full text-xl"
		disabled={isLoading || !form.email || !form.password}
	>
		{#if isLoading}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		Sign In
	</button>
</form>
