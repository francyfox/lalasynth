import { PRESS_START_2P_B64 } from "@/modules/badge/press-start-2p.b64";

const FONT_FACE = `@font-face {
    font-family: 'Press Start 2P';
    font-style: normal;
    font-weight: 400;
    src: url('data:font/woff2;base64,${PRESS_START_2P_B64}') format('woff2');
  }`;

const LABEL_W = 95;
const VALUE_W = 50;
const TOTAL_W = LABEL_W + VALUE_W; // 145
const H = 28;

export function bestWpmBadge(value: number | null): string {
	const display = value !== null ? String(value) : "—";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${TOTAL_W}" height="${H}" role="img" aria-label="Best WPM: ${display}">
  <title>Best WPM: ${display}</title>
  <defs>
    <style>${FONT_FACE}</style>
    <!-- Dithered dark-violet background (2×2 checkerboard) -->
    <pattern id="dither" x="0" y="0" width="2" height="2" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="#0a0520"/>
      <rect x="1" width="1" height="1" fill="#150b38"/>
      <rect y="1" width="1" height="1" fill="#150b38"/>
      <rect x="1" y="1" width="1" height="1" fill="#0a0520"/>
    </pattern>
    <!-- CRT scanline overlay -->
    <pattern id="scanlines" x="0" y="0" width="1" height="2" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="transparent"/>
      <rect y="1" width="1" height="1" fill="#000000" fill-opacity="0.10"/>
    </pattern>
  </defs>

  <!-- Label bg: PC-98 dithered violet-black -->
  <rect width="${LABEL_W}" height="${H}" fill="url(#dither)" shape-rendering="crispEdges"/>
  <!-- Value bg: arcade-amber -->
  <rect x="${LABEL_W}" width="${VALUE_W}" height="${H}" fill="#ffcc00"/>

  <!-- Separator: dark | highlight -->
  <rect x="${LABEL_W - 1}" width="1" height="${H}" fill="#3a1f99" shape-rendering="crispEdges"/>
  <rect x="${LABEL_W}" width="1" height="${H}" fill="#aa88ff" fill-opacity="0.45" shape-rendering="crispEdges"/>

  <!-- Outer border -->
  <rect x="0.5" y="0.5" width="${TOTAL_W - 1}" height="${H - 1}" fill="none" stroke="#7755ee" stroke-width="1" shape-rendering="crispEdges"/>

  <!-- ♪ icon -->
  <text x="8" y="19" font-family="'Press Start 2P', monospace" font-size="14" fill="#ff44cc">&#9834;</text>

  <!-- Label text -->
  <text x="23" y="19" font-family="'Press Start 2P', monospace" font-size="8" fill="#e2cfff" letter-spacing="0.5">BEST WPM</text>

  <!-- Value (WPM number), centred in right section -->
  <text
    x="${LABEL_W + VALUE_W / 2}"
    y="20"
    font-family="'Press Start 2P', monospace"
    font-size="10"
    fill="#1a0800"
    text-anchor="middle"
    letter-spacing="1"
  >${display}</text>

  <!-- Scanlines on top of everything -->
  <rect width="${TOTAL_W}" height="${H}" fill="url(#scanlines)" shape-rendering="crispEdges"/>
</svg>`;
}
