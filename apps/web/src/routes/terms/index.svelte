<!-- routify:meta _skip=true -->
<script lang="ts">
	import { goto } from "@roxi/routify";
	const _init = $goto;
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-base-200 to-base-300 p-4">
	<div class="w-full max-w-2xl">
		<div class="card bg-base-100 shadow-xl">

			<div class="bg-base-200 px-6 py-4 flex items-center justify-between">
				<h1 class="text-xl font-bold">Terms of Service & Privacy Policy</h1>
				<span class="text-base-content/40 text-xs">Last updated: March 13, 2026</span>
			</div>

			<div class="card-body gap-6">

				<section>
					<h2 class="font-bold text-base mb-2">1. Acceptance of Terms</h2>
					<p class="text-base-content/70 text-sm leading-relaxed">
						By accessing or using Lalasynth (the "Service"), you confirm that you have read,
						understood, and agree to be bound by these Terms of Service. If you do not agree
						with any part of these terms, please discontinue use of the Service immediately.
					</p>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">2. Data We Collect</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">
						To operate the Service, we collect the following information:
					</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Account data</strong> — username, email address, and avatar obtained via GitHub OAuth during sign-in.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Game statistics</strong> — session results, scores, typing speed, and match history.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Technical data</strong> — IP address, browser type, device info, and error logs for diagnostics.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Session tokens</strong> — encrypted authentication tokens stored in our database.</span></li>
					</ul>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">3. How We Use Your Data</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">Collected data is used solely for:</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Identifying and authenticating users in multiplayer sessions</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Maintaining leaderboards and displaying game statistics</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Improving Service quality and stability</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Preventing fraud and abuse</span></li>
					</ul>
					<p class="text-base-content/70 text-sm leading-relaxed mt-3">
						We <strong class="text-base-content">do not sell</strong> your data to third parties and do not use it for advertising purposes.
					</p>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">4. Third-Party Services</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">The Service integrates with the following external platforms:</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">GitHub OAuth</strong> — for sign-in. We only receive your public profile and email.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">YouTube / Invidious</strong> — for streaming audio tracks. Audio is not stored on our servers.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">LRCLIB</strong> — for fetching song lyrics. Results are cached in our database.</span></li>
					</ul>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">5. Data Storage & Security</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">
						Lalasynth is open-source and can be self-hosted. Data storage depends on the instance you are using:
					</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Self-hosted instances</strong> — data stays entirely on the server operated by the instance owner. The operator is responsible for data security and privacy.</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span><strong class="text-base-content">Official instance</strong> — data is stored in Turso, a third-party managed database. Turso's own privacy policy applies to data on their infrastructure.</span></li>
					</ul>
					<p class="text-base-content/70 text-sm leading-relaxed mt-3">
						Session tokens are encrypted regardless of the deployment. If you are unsure which instance you are using, check the URL in your browser.
					</p>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">6. Your Rights</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">You have the right to:</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Request access to your personal data</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Request correction of inaccurate data</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Delete your account and associated data</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Object to data processing</span></li>
					</ul>
					<p class="text-base-content/70 text-sm leading-relaxed mt-3">
						Account deletion is not available in the app itself. To request deletion of your
						account and associated data, contact the operator of the instance you are using
						by email. For the official instance, the contact method is listed on the project's
						GitHub page. We will process your request within a reasonable timeframe.
					</p>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">7. Acceptable Use</h2>
					<p class="text-base-content/70 text-sm leading-relaxed mb-3">By using the Service you agree not to:</p>
					<ul class="text-base-content/70 text-sm space-y-2">
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Use automated tools (bots, scripts) to gain an unfair advantage</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Disrupt servers or cause excessive load</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Attempt to access other users' data without authorisation</span></li>
						<li class="flex gap-2"><span class="text-base-content/40 mt-0.5">▸</span><span>Use offensive usernames or post harmful content</span></li>
					</ul>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">8. Changes to These Terms</h2>
					<p class="text-base-content/70 text-sm leading-relaxed">
						We reserve the right to update these terms at any time. For material changes,
						we will notify users through the Service interface. Continued use of the Service
						after changes are published constitutes your acceptance of the revised terms.
					</p>
				</section>

				<div class="divider my-0"></div>

				<section>
					<h2 class="font-bold text-base mb-2">9. Disclaimer of Warranties</h2>
					<p class="text-base-content/70 text-sm leading-relaxed">
						The Service is provided "as is". We are not liable for outages of external
						services (YouTube, GitHub, LRCLIB), loss of game progress due to technical
						failures, or actions of third parties.
					</p>
				</section>

				<div class="divider my-0"></div>

				<div class="flex items-center justify-between">
					<span class="text-base-content/40 text-xs">Questions? Open an issue on the Lalasynth GitHub repository.</span>
					<button class="btn btn-sm" onclick={() => $goto("/auth")}>← Back</button>
				</div>

			</div>
		</div>
	</div>
</div>