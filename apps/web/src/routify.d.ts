import "@roxi/routify";

declare module "@roxi/routify" {
	interface RoutifyMeta {
		_auth?: boolean;
		title?: string;
		hideNavigation?: boolean;
	}
}
