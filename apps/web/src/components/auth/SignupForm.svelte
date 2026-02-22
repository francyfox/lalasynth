<script lang="ts">
	import UInput from '@package/ui/input/UInput.svelte';
	import type { SignupFormData } from '@/lib/schemas/auth';

	let form: SignupFormData = {
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	};
	export let onSubmit: (form: SignupFormData) => void;
	export let isLoading: boolean = false;

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSubmit(form);
	}
</script>

<form on:submit={handleSubmit} class="space-y-4">
	<UInput
		type="text"
		id="signup-name"
		label="Name"
		placeholder="Your name"
		bind:value={form.name}
		disabled={isLoading}
	/>
	<UInput
		type="email"
		id="signup-email"
		bind:value={form.email}
		disabled={isLoading}
	/>
	<UInput
		type="password"
		id="signup-password"
		bind:value={form.password}
		disabled={isLoading}
	/>
	<UInput
		type="password"
		id="signup-confirm"
		label="Confirm Password"
		bind:value={form.confirmPassword}
		disabled={isLoading}
		showHint={false}
	/>
	<button
		type="submit"
		class="btn btn-primary w-full"
		disabled={isLoading ||
			!form.email ||
			!form.password ||
			!form.confirmPassword ||
			!form.name}
	>
		{#if isLoading}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		Sign Up
	</button>
</form>
