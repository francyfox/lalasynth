<script lang="ts">
	import AuthProviders from '@/components/auth/AuthProviders.svelte'
	import { authStore } from '@/lib/stores/auth';
	import type { LoginFormData, SignupFormData } from '@/lib/schemas/auth';
	import LoginForm from './LoginForm.svelte';
	import SignupForm from './SignupForm.svelte';
	import { goto } from '@roxi/routify'

	const _init = $goto;

	type Tab = 'login' | 'signup';

	let activeTab: Tab = 'login';

	function switchTab(tab: Tab) {
		activeTab = tab;
		authStore.clearError();
		authStore.clearSuccess();
	}

	async function handleLogin(formData: LoginFormData) {
		const success = await authStore.login(formData);

		if (success) {
			$goto('/lobby')
		}
	}

	async function handleSignup(formData: SignupFormData) {
		const success = await authStore.signup(formData);

		if (success) {
			$goto('/lobby')
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
	<div class="w-full max-w-md">
		<div class="card bg-base-100 shadow-xl">

			<div class="menu menu-vertical lg:menu-horizontal bg-base-200 w-full">
				<button
						class="tab tab-lg text-2xl font-medium {activeTab === 'login' ? 'tab-active' : ''}"
						on:click={() => switchTab('login')}
				>
					Login
				</button>
				<button
						class="tab tab-lg text-2xl font-medium {activeTab === 'signup' ? 'tab-active' : ''}"
						on:click={() => switchTab('signup')}
				>
					Register
				</button>
			</div>

			<div class="card-body">
				<!-- LOGIN TAB -->
				{#if activeTab === 'login'}
					<h2 class="card-title text-2xl font-bold mb-6">Welcome back, sweet heart!</h2>

					<LoginForm
							onSubmit={handleLogin}
							isLoading={$authStore.isLoading}
					/>

					<AuthProviders />
				{/if}

				<!-- SIGNUP TAB -->
				{#if activeTab === 'signup'}
					<h2 class="card-title text-2xl font-bold mb-6">Create Account</h2>

					<SignupForm
						onSubmit={handleSignup}
						isLoading={$authStore.isLoading}
					/>

					<AuthProviders />
				{/if}
			</div>
		</div>
	</div>
</div>
