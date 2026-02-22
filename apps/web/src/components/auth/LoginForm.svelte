<script lang="ts">
	import { validator } from '@felte/validator-zod'
	import UInput from '@package/ui/input/UInput.svelte';
	import { type LoginFormData, loginSchema } from '@/lib/schemas/auth';
	import { createForm } from 'felte';
	export let onSubmit: (form: LoginFormData) => void;
	export let isLoading: boolean = false;

	const { form, errors, isDirty, isValid } = createForm({
		extend: [
			validator({ schema: loginSchema })
		],
		onSubmit: (values) => {
			onSubmit(values);
		},
	})
</script>

<form use:form class="space-y-4">
	<UInput
		type="email"
		id="login-email"
		name="email"
		disabled={isLoading}
		hintText={$isDirty && $errors.email?.[0]}
	/>
	<UInput
		type="password"
		id="login-password"
		name="password"
		disabled={isLoading}
		hintText={$isDirty && $errors.password?.[0]}
	/>
	<button
		type="submit"
		class="btn btn-primary w-full text-xl"
		disabled={!$isValid || isLoading}
	>
		{#if isLoading}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		Sign In
	</button>
</form>
