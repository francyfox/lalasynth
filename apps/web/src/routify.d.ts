import "@roxi/routify";

declare module "@roxi/routify" {
	interface RoutifyMeta {
		_auth?: boolean;
		_skip?: boolean;
		title?: string;
		hideNavigation?: boolean;
	}
}
