<script lang="ts">
	export let value: string = '';
	export let disabled: boolean = false;
	export let id: string = 'email';

	const emailPattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
</script>

<div class="form-control">
	<label class="label text-xl" for={id}>
		<span class="label-text font-semibold text-xl">Email</span>
	</label>
	<input
		{id}
		type="email"
		placeholder="your@email.com"
		class="input input-bordered text-xl user-invalid:validator"
		bind:value
		{disabled}
		required
		pattern={emailPattern}
		title="Please enter a valid email address"
	/>
	<div class="validator-hint hidden text-sm mt-1">Please enter a valid email address</div>
</div>
