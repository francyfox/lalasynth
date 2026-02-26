import { writable } from "svelte/store";
import { authClient, fetchOptions } from "@/lib/auth-client";
import { queryClient } from "@/lib/query-client";
import {
	type LoginFormData,
	loginSchema,
	type SignupFormData,
	signupSchema,
} from "@/lib/schemas/auth";

interface AuthState {
	isLoading: boolean;
	error: string | null;
	success: string | null;
}

const initialState: AuthState = {
	isLoading: false,
	error: null,
	success: null,
};

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(initialState);

	return {
		subscribe,
		reset: () => set(initialState),
		clearError: () => update((state) => ({ ...state, error: null })),
		clearSuccess: () => update((state) => ({ ...state, success: null })),

		login: async (formData: LoginFormData) => {
			update((state) => ({
				...state,
				isLoading: true,
				error: null,
				success: null,
			}));

			const validation = loginSchema.safeParse(formData);
			if (!validation.success) {
				const errorMessage = validation.error.message;
				update((state) => ({
					...state,
					error: errorMessage,
					isLoading: false,
				}));
				return false;
			}

			try {
				const result = await authClient.signIn.email({
					email: validation.data.email,
					password: validation.data.password,
					fetchOptions,
				});

				if ((result as { data: unknown }).data) {
					await queryClient.invalidateQueries({ queryKey: ["session"] });
					update((state) => ({
						...state,
						isLoading: false,
					}));
					return true;
				}
				update((state) => ({
					...state,
					isLoading: false,
				}));
				return false;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Login failed";
				update((state) => ({
					...state,
					error: errorMessage,
					isLoading: false,
				}));
				return false;
			}
		},

		signup: async (formData: SignupFormData) => {
			update((state) => ({
				...state,
				isLoading: true,
				error: null,
				success: null,
			}));

			// Validate with Zod
			const validation = signupSchema.safeParse(formData);
			if (!validation.success) {
				const errorMessage = validation.error.message;
				update((state) => ({
					...state,
					error: errorMessage,
					isLoading: false,
				}));
				return false;
			}

			try {
				const result = await authClient.signUp.email({
					email: validation.data.email,
					password: validation.data.password,
					name: validation.data.name,
					fetchOptions,
				});

				if ((result as { data: unknown }).data) {
					update((state) => ({
						...state,
						success: "Registration successful! Check your email.",
						isLoading: false,
					}));
					return true;
				}
				update((state) => ({
					...state,
					isLoading: false,
				}));
				return false;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Registration failed";
				update((state) => ({
					...state,
					error: errorMessage,
					isLoading: false,
				}));
				return false;
			}
		},

		socialAuth: async (provider: "github" | "google") => {
			update((state) => ({
				...state,
				isLoading: true,
				error: null,
				success: null,
			}));

			try {
				await authClient.signIn.social({
					provider,
					callbackURL: `http://${window.location.host}/lobby`,
					fetchOptions,
				});
				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : `${provider} auth failed`;
				update((state) => ({
					...state,
					error: errorMessage,
					isLoading: false,
				}));
				return false;
			}
		},
	};
}

export const authStore = createAuthStore();
