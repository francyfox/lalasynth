<script lang="ts">
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = 'text';
	export let label: string = 'Text';
	export let placeholder: string = '';
	export let minLength: number = 1;
	export let required: boolean = true;
</script>

<div class="form-control">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">{label}</span>
	</label>
	<input
		{id}
		type="text"
		{placeholder}
		class="input input-bordered text-xl user-invalid:validator"
		bind:value
		{disabled}
		{required}
		{minLength}
		title={`${label} is required`}
	/>
	<div class="validator-hint hidden text-sm mt-1">{label} is required</div>
</div>
