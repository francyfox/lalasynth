<script lang="ts">
	import { authStore } from '@/lib/stores/auth';
	import type { LoginFormData, SignupFormData } from '@/lib/schemas/auth';
	import UInput from '@package/ui/input/UInput.svelte';

	type Tab = 'login' | 'signup';

	let activeTab: Tab = 'login';

	let loginForm: LoginFormData = {
		email: '',
		password: '',
	};

	let signupForm: SignupFormData = {
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	};

	function switchTab(tab: Tab) {
		activeTab = tab;
		authStore.clearError();
		authStore.clearSuccess();
	}

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		const success = await authStore.login(loginForm);
		if (success) {
			loginForm = { email: '', password: '' };
		}
	}

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		const success = await authStore.signup(signupForm);
		if (success) {
			signupForm = { name: '', email: '', password: '', confirmPassword: '' };
			setTimeout(() => {
				switchTab('login');
			}, 2000);
		}
	}

	async function handleSocialAuth(provider: 'github' | 'google') {
		await authStore.socialAuth(provider);
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
			<!-- Error Alert -->
			{#if $authStore.error}
				<div class="alert alert-error mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2"
						/>
					</svg>
					<span>{$authStore.error}</span>
				</div>
			{/if}

			<!-- Success Alert -->
			{#if $authStore.success}
				<div class="alert alert-success mb-4">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{$authStore.success}</span>
				</div>
			{/if}

				<!-- LOGIN TAB -->
				{#if activeTab === 'login'}
					<h2 class="card-title text-2xl font-bold mb-6">Welcome back, sweet heart!</h2>

					<form on:submit={handleLogin} class="space-y-4">
						<UInput
							type="email"
							id="login-email"
							bind:value={loginForm.email}
							disabled={$authStore.isLoading}
						/>

						<UInput
							type="password"
							id="login-password"
							bind:value={loginForm.password}
							disabled={$authStore.isLoading}
							showHint={false}
						/>

						<button
							type="submit"
							class="btn btn-primary w-full text-xl"
							disabled={$authStore.isLoading || !loginForm.email || !loginForm.password}
						>
							{#if $authStore.isLoading}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Sign In
						</button>
					</form>

					<div class="divider text-2xl">or</div>

					<div class="space-y-2">
						<button
							on:click={() => handleSocialAuth('github')}
							disabled={$authStore.isLoading}
							class="btn btn-outline w-full text-xl gap-2"
						>
							{#if $authStore.isLoading}
								<span class="loading loading-spinner loading-sm"></span>
							{:else}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.194 20 14.44 20 10.017 20 4.484 15.522 0 10 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
							GitHub
						</button>
					</div>
				{/if}

				<!-- SIGNUP TAB -->
				{#if activeTab === 'signup'}
					<h2 class="card-title text-2xl font-bold mb-6">Create Account</h2>

					<form on:submit={handleSignup} class="space-y-4">
						<UInput
							type="text"
							id="signup-name"
							label="Name"
							placeholder="Your name"
							bind:value={signupForm.name}
							disabled={$authStore.isLoading}
						/>

						<UInput
							type="email"
							id="signup-email"
							bind:value={signupForm.email}
							disabled={$authStore.isLoading}
						/>

						<UInput
							type="password"
							id="signup-password"
							bind:value={signupForm.password}
							disabled={$authStore.isLoading}
						/>

						<UInput
							type="password"
							id="signup-confirm"
							label="Confirm Password"
							bind:value={signupForm.confirmPassword}
							disabled={$authStore.isLoading}
							showHint={false}
						/>

						<button
							type="submit"
							class="btn btn-primary w-full"
							disabled={$authStore.isLoading ||
								!signupForm.email ||
								!signupForm.password ||
								!signupForm.confirmPassword ||
								!signupForm.name}
						>
							{#if $authStore.isLoading}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Sign Up
						</button>
					</form>

					<div class="divider">or</div>

					<div class="space-y-2">
						<button
							on:click={() => handleSocialAuth('github')}
							disabled={$authStore.isLoading}
							class="btn btn-outline w-full gap-2"
						>
							{#if $authStore.isLoading}
								<span class="loading loading-spinner loading-sm"></span>
							{:else}
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
									<path
										fill-rule="evenodd"
										d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.544 2.914 1.19.092-.926.35-1.557.636-1.914-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.817c.85.004 1.705.114 2.504.336 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.194 20 14.44 20 10.017 20 4.484 15.522 0 10 0z"
										clip-rule="evenodd"
									/>
								</svg>
							{/if}
							GitHub
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
