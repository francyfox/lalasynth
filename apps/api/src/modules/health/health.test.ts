import { describe, expect, it } from "bun:test";
import { app } from "@/index";

describe("Health", () => {
	it("returns a response", async () => {
		const response = await app
			.handle(new Request("http://localhost:3000/health"))
			.then((res) => res.text());

		expect(response).toBe("OK");
	});
});
