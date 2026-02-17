import { createTimeline, remove, splitText, stagger } from "animejs";

export function animateBounceText(target: string) {
	const { chars } = splitText(target, {
		words: { wrap: "clip" },
		chars: true,
	});

	return createTimeline({
		defaults: { ease: "inOut(3)", duration: 3000 },
	})
		.add(
			chars,
			{
				opacity: [
					{ to: ["0", "100%"] },
					{ to: "-100%", delay: 1000, ease: "in(3)" },
				],
				y: [
					{ to: ["100%", "0%"] },
					{ to: "-100%", delay: 1000, ease: "in(3)" },
				],
				duration: 1000,
				rotate: [90, 0],
				ease: "outBounce",
				delay: stagger(100),
				loop: false,
			},
			stagger(10, { from: "random" }),
		)
		.init();
}

export function animateLogo() {
	return createTimeline({
		defaults: { ease: "inOut(3)", duration: 650 },
	}).add("svg[data-name='logo'", {
		opacity: [
			{ to: ["0", "100%"] },
			{ to: "-100%", delay: 1750, ease: "in(3)" },
		],
		y: [{ to: ["100%", "0%"] }, { to: "-100%", delay: 1750, ease: "in(3)" }],
		duration: 1000,
		rotate: [90, 0],
		ease: "outBounce",
		delay: stagger(100),
		loop: false,
	});
}
