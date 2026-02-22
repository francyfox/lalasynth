<script lang="ts">
	export let type: 'text' | 'email' | 'password' = 'text';
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = type;
	export let name: string = '';
	export let label: string = type.charAt(0).toUpperCase() + type.slice(1);
	export let placeholder: string = '';
	export let minLength: number = type === 'password' ? 8 : 1;
	export let required: boolean = true;
	export let hintText: string | boolean = '';
</script>

<div class="form-control w-full flex flex-col">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">{label}</span>
	</label>
	<input
		{id}
		{type}
		{name}
		placeholder={placeholder}
		class="w-full input input-bordered text-xl {!!hintText && 'input-error'}"
		bind:value
		{disabled}
		{required}
		minlength={minLength}
	/>
	{#if hintText}
		<div class="text-red-400 text-sm mt-1">{hintText}</div>
	{/if}
</div>
