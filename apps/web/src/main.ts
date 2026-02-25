import { mount } from "svelte";
import App from "./App.svelte";
import "@fontsource-variable/alegreya";

const app = mount(App, {
	target: document.getElementById("app")!,
});

export default app;
