<script lang="ts">
	export let type: 'text' | 'email' | 'password' = 'text';
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = type;
	export let label: string = type.charAt(0).toUpperCase() + type.slice(1);
	export let placeholder: string = '';
	export let minLength: number = type === 'password' ? 8 : 1;
	export let required: boolean = true;
	export let showHint: boolean = true;
	export let hintText: string = '';
	export let pattern: string | undefined = undefined;

	// Default email pattern if type is email and no pattern provided
	const emailPattern = '^[^\s@]+@[^\s@]+\.[^\s@]+$';
	$: actualPattern = type === 'email' ? (pattern || emailPattern) : pattern;

	// Default placeholders based on type
	$: actualPlaceholder = placeholder || (
		type === 'email' ? 'your@email.com' :
		type === 'password' ? '••••••••' :
		''
	);

	// Default hint text based on type
	$: actualHint = hintText || (
		type === 'email' ? 'Please enter a valid email address' :
		type === 'password' ? `At least ${minLength} characters` :
		`${label} is required`
	);
</script>

<div class="form-control flex flex-col">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">{label}</span>
	</label>
	<input
		{id}
		{type}
		placeholder={actualPlaceholder}
		class="input input-bordered text-xl user-invalid:validator"
		bind:value
		{disabled}
		{required}
		minlength={minLength}
		pattern={actualPattern}
		title={actualHint}
		noValidate
	/>
	{#if showHint}
		<div class="validator-hint hidden text-sm mt-1">{actualHint}</div>
	{/if}
</div>
