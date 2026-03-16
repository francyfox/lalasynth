export function makeCrusherCurve(bits: number): Float32Array<ArrayBuffer> {
	const n = 512;
	const curve = new Float32Array(new ArrayBuffer(n * 4));
	const step = 0.5 ** (bits - 1);
	for (let i = 0; i < n; i++) {
		const x = (i * 2) / n - 1;
		curve[i] = Math.round(x / step) * step;
	}
	return curve;
}
