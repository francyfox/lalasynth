<script lang="ts">
	import { validator } from '@felte/validator-zod'
	import UInput from '@package/ui/input/UInput.svelte';
	import { type SignupFormData, signupSchema } from '@/lib/schemas/auth';
	import { createForm } from 'felte'
	export let onSubmit: (form: SignupFormData) => void;
	export let isLoading: boolean = false;

	const { form, errors, isDirty, isValid } = createForm({
		extend: [
			validator({ schema: signupSchema })
		],
		onSubmit: (values) => {
			onSubmit(values);
		},
	})
</script>

<form use:form class="space-y-4">
	<UInput
		type="text"
		id="signup-name"
		name="name"
		label="Name"
		placeholder="Your name"
		disabled={isLoading}
		hintText={$isDirty && $errors.name?.[0]}
	/>
	<UInput
		type="email"
		id="signup-email"
		name="email"
		hintText={$isDirty && $errors.email?.[0]}
		disabled={isLoading}
	/>
	<UInput
		type="password"
		id="signup-password"
		name="password"
		hintText={$isDirty && $errors.password?.[0]}
		disabled={isLoading}
	/>
	<UInput
		type="password"
		id="signup-confirm"
		label="Confirm Password"
		name="confirmPassword"
		hintText={$isDirty && $errors.confirmPassword?.[0]}
		disabled={isLoading}
	/>
	<button
		type="submit"
		class="btn btn-primary w-full text-lg"
		disabled={!$isValid || isLoading}
	>
		{#if isLoading}
			<span class="loading loading-spinner loading-sm"></span>
		{/if}
		Sign Up
	</button>
</form>
