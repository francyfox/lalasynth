<script lang="ts">
	export let type: 'text' | 'email' | 'password' = 'text';
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = type;
	export let label: string = type.charAt(0).toUpperCase() + type.slice(1);
	export let placeholder: string = '';
	export let minLength: number = type === 'password' ? 8 : 1;
	export let required: boolean = true;
	export let hintText: string = '';
</script>

<div class="form-control flex flex-col">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">{label}</span>
	</label>
	<input
		{id}
		{type}
		placeholder={placeholder}
		class="input input-bordered text-xl user-invalid:validator"
		bind:value
		{disabled}
		{required}
		minlength={minLength}
		noValidate
	/>
	{#if hintText}
		<div class="validator-hint hidden text-sm mt-1">{hintText}</div>
	{/if}
</div>
