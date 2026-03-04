import type { Snippet } from "svelte";

export type ModalConfig = {
	title?: string;
	body?: string;
	snippet?: Snippet;
	confirmText?: string;
	cancelText?: string;
	onConfirm?: () => void | Promise<void>;
	onCancel?: () => void;
};

type ModalState = {
	open: boolean;
	config: ModalConfig | null;
	loading: boolean;
};

const state = $state<ModalState>({
	open: false,
	config: null,
	loading: false,
});

let resolvePromise: ((value: boolean) => void) | null = null;

export const modalState = {
	get open() {
		return state.open;
	},
	get config() {
		return state.config;
	},
	get loading() {
		return state.loading;
	},
};

export function openModal(config: ModalConfig): Promise<boolean> {
	state.config = {
		...config,
		confirmText: config.confirmText ?? "OK",
	};
	state.open = true;
	state.loading = false;

	return new Promise<boolean>((resolve) => {
		resolvePromise = resolve;
	});
}

export function closeModal(): void {
	if (resolvePromise) {
		resolvePromise(false);
		resolvePromise = null;
	}
	state.config?.onCancel?.();
	state.open = false;
	state.config = null;
	state.loading = false;
}

export async function confirmModal(): Promise<void> {
	state.loading = true;
	try {
		await state.config?.onConfirm?.();
		if (resolvePromise) {
			resolvePromise(true);
			resolvePromise = null;
		}
	} finally {
		state.open = false;
		state.config = null;
		state.loading = false;
	}
}