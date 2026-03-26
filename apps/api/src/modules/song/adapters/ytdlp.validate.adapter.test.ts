/**
 * Integration test for YtdlpProvider.validate()
 *
 * Requires real network access and a real yt-dlp installation to pass fully.
 * On cloud environments (Render.com, CI without a browser) the test is still
 * informative: it prints what succeeded and what failed, but it does NOT fail
 * the suite when YouTube is blocked — it only asserts that the result is
 * structurally correct.
 *
 * Run with:
 *   bun test src/modules/song/adapters/ytdlp.validate.adapter.test.ts
 */

import { describe, expect, it } from "vitest";
import { YtdlpProvider } from "./ytdlp.adapter";

describe("YtdlpProvider.validate() — integration", () => {
	it("returns a structured result and diagnoses real failure modes", async () => {
		const provider = YtdlpProvider();
		const result = await provider.validate();

		// Structural assertion — always passes regardless of environment
		expect(typeof result.ok).toBe("boolean");
		if (!result.ok) {
			expect(typeof result.reason).toBe("string");
		}

		// Diagnostic output so failures are easy to read in logs
		if (result.ok) {
			console.log(
				"[validate] PASS — yt-dlp installed, browser found, YouTube reachable",
			);
		} else {
			console.warn(`[validate] FAIL — ${result.reason}`);

			const reason = result.reason ?? "";
			if (reason.includes("yt-dlp not installed")) {
				console.warn("  diagnosis: yt-dlp binary is missing from PATH");
			} else if (reason.includes("No browser available")) {
				console.warn(
					"  diagnosis: no browser (firefox/chromium/chrome/brave) found — " +
						"cookie extraction will fail on cloud hosts",
				);
			} else if (reason.includes("YouTube unreachable or blocked")) {
				console.warn(
					"  diagnosis: yt-dlp and browser are present but YouTube is blocked " +
						"from this IP (common on Render.com / AWS / GCP egress)",
				);
			}
		}

		// The test is informative-only: ok may be false on cloud.
		// We accept either a successful result OR a string reason.
		expect(result.ok === true || typeof result.reason === "string").toBe(true);
	}, 30_000);
});
