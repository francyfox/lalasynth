import { writable } from "svelte/store";

const createScenesStore = () => {
	const { subscribe, set, update } = writable([]);

	return {
		subscribe,
		getCurrent: () => {},
	};
};

export const scenesStore = createScenesStore();
