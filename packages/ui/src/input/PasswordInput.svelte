<script lang="ts">
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = 'password';
	export let label: string = 'Password';
	export let minLength: number = 8;
	export let showHint: boolean = true;
	export let hintText: string = '';
</script>

<div class="form-control">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">{label}</span>
	</label>
	<input
		{id}
		type="password"
		placeholder="••••••••"
		class="input input-bordered text-xl user-invalid:validator"
		bind:value
		{disabled}
		required
		{minLength}
		title={hintText || `Minimum ${minLength} characters`}
	/>
	{#if showHint}
		<div class="validator-hint hidden text-sm mt-1">{hintText || `At least ${minLength} characters`}</div>
	{/if}
</div>
