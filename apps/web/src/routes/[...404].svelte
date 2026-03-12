<script lang="ts">
	let { url } = $props<{ url: string }>();

	$effect(() => {
		const handler = () => { window.location.href = '/menu'; };
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	});


	function strToHex(s: string, offset: number): string {
		let hash = offset;
		for (let i = 0; i < s.length; i++) {
			hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
		}
		return (Math.abs(hash) >>> 0).toString(16).toUpperCase().padStart(8, '0');
	}

	const addr1 = $derived(strToHex(url ?? '', 0xDEAD));
	const addr2 = $derived(strToHex(url ?? '', 0xBEEF));
	const addr3 = $derived(strToHex(url ?? '', 0xCAFE));
	const addr4 = $derived(strToHex(url ?? '', 0xF00D));
</script>

<div class="font-mono fixed inset-0 flex items-center justify-center z-[9999] text-white text-sm leading-relaxed" style="background:#0000AA">
	<div class="w-[min(700px,90vw)] space-y-5">
		<pre class="text-sm leading-3">
8         8      .d88b.               w   8
8    .d88 8 .d88 YPwww. Yb  dP 8d8b. w8ww 8d8b.
8    8  8 8 8  8     d8  YbdP  8P Y8  8   8P Y8
8888 `Y88 8 `Y88 `Y88P'   dP   8   8  Y8P 8   8
                         dP
		</pre>

		<p class="whitespace-pre-wrap">A problem has been detected and LalaSynth has been shut down to prevent damage<br>to your computer.</p>

		<p class="font-bold tracking-wide mb-6 whitespace-pre-wrap">PAGE_FAULT_IN_NONPAGED_AREA</p>

		<p class="whitespace-pre-wrap">
			If this is the first time you've seen this Stop error screen,<br>
			restart your computer. If this screen appears again, follow<br>
			these steps:
		</p>

		<p class="whitespace-pre-wrap">
			Read the Lord's Prayer three times.
		</p>

		<p class="whitespace-pre-wrap">
			Read the JavaScript specification
		</p>

		<p>Technical information:</p>

		<p class="font-bold">*** STOP: 0x00000050 (0x{addr1}, 0x00000000, 0x{addr2}, 0x00000000)</p>

		<p class="font-bold">*** {url ?? 'UNKNOWN_MODULE'}.SYS - Address {addr3} base at {addr4}, DateStamp 3d6dd67c</p>

		<p class="mt-6 opacity-90 whitespace-pre-wrap">
			Beginning dump of physical memory<br>
			Physical memory dump complete.<br>
			Contact your system administrator <span class="font-black">&lt;7info7web@gmail.com&gt;</span> or technical support group for further assistance.
		</p>

		<p class="mt-10 opacity-85">Press any key to restart <span class="blink">_</span></p>
	</div>
</div>

<style>
	.blink {
		animation: blink 2s infinite ease-in-out;
	}
	@keyframes blink {
		0%, 100% { opacity: 1; }
		50%       { opacity: 0; }
	}
</style>