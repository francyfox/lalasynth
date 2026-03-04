type InMessage =
	| { type: "stream"; id: string; url: string }
	| { type: "cancel"; id: string };

type OutMessage =
	| { type: "chunk"; id: string; data: ArrayBuffer }
	| { type: "done"; id: string }
	| { type: "error"; id: string; error: string };

const controllers = new Map<string, AbortController>();

self.addEventListener("message", async (e: MessageEvent<InMessage>) => {
	const msg = e.data;

	if (msg.type === "cancel") {
		controllers.get(msg.id)?.abort();
		controllers.delete(msg.id);
		return;
	}

	const { id, url } = msg;
	const controller = new AbortController();
	controllers.set(id, controller);

	try {
		const res = await fetch(url, { signal: controller.signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const reader = res.body!.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			// Slice exact bytes — value.buffer may be a larger shared ArrayBuffer
			const chunk = value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
			self.postMessage(
				{ type: "chunk", id, data: chunk } satisfies OutMessage,
				{ transfer: [chunk] },
			);
		}

		self.postMessage({ type: "done", id } satisfies OutMessage);
	} catch (err) {
		if ((err as Error).name === "AbortError") return;
		self.postMessage({
			type: "error",
			id,
			error: (err as Error).message,
		} satisfies OutMessage);
	} finally {
		controllers.delete(id);
	}
});
