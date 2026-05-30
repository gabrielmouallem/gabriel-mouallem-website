/**
 * Generates the 1200×630 social-share card (public/og-image.png) used by the
 * Open Graph / Twitter tags. Editorial dark treatment that echoes the site:
 * monospace type, hard corners, a dashed frame — now over the same blueprint
 * GRID (column module + /8 subdivision, faded from the top) and the bottom
 * lime→blue MESH triangle the live page uses in dark mode.
 *
 * Run with: `node scripts/generate-og.mjs`.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "public", "og-image.png");

const W = 1200;
const H = 630;

// Dark-mode page background, matching global.css `--page-bg` (#0a0a0a).
const PAGE_BG = "#0a0a0a";

// ── Grid geometry (mirrors global.css) ───────────────────────────────────
// gutter = 4.5% of width; 6-column module between gutters; /8 inner cell.
const GUTTER = +(W * 0.045).toFixed(2); // 54
const MODULE = +((W - GUTTER * 2) / 6).toFixed(2); // 182
const CELL = +(MODULE / 8).toFixed(3); // 22.75

// Dark-mode grid line tones (global.css --grid-minor / --grid-major).
const MINOR = "rgba(255,255,255,0.05)";
const MAJOR = "rgba(255,255,255,0.085)";

// ── Bottom mesh (mirrors index.astro meshBars + global.css ramp) ──────────
const MESH_BARS = [25, 38, 52, 66, 80, 93, 100, 93, 80, 66, 52, 38, 25];
const MESH_W = 1480; // wider than the card so the base runs off both edges
const MESH_X0 = (W - MESH_W) / 2; // -140
const MESH_H = 300; // peak bar height in px
const BAR_W = MESH_W / MESH_BARS.length;

const bars = MESH_BARS.map((h, i) => {
  const bw = BAR_W + 6; // slight overlap so neighbours fuse when blurred
  const x = (MESH_X0 + i * BAR_W - 3).toFixed(2);
  const bh = ((h / 100) * MESH_H).toFixed(2);
  const y = (H - bh).toFixed(2);
  return `<rect x="${x}" y="${y}" width="${bw.toFixed(2)}" height="${bh}" fill="url(#mesh)"/>`;
}).join("");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Blueprint grid: fine /8 cell + bold module lines, anchored to the
         gutter on X so verticals land on the column edges. -->
    <pattern id="grid-minor" width="${CELL}" height="${CELL}"
             patternUnits="userSpaceOnUse" patternTransform="translate(${GUTTER} 0)">
      <path d="M0 0 V${CELL} M0 0 H${CELL}" stroke="${MINOR}" stroke-width="1"/>
    </pattern>
    <pattern id="grid-major" width="${MODULE}" height="${MODULE}"
             patternUnits="userSpaceOnUse" patternTransform="translate(${GUTTER} 0)">
      <path d="M0 0 V${MODULE} M0 0 H${MODULE}" stroke="${MAJOR}" stroke-width="1"/>
    </pattern>

    <!-- Grid strongest up top, eased toward the bottom (site uses a radial
         ellipse at 50% 0%; a vertical fade reads the same on the card). -->
    <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
      <stop offset="48%" stop-color="#fff" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="grid-mask">
      <rect width="${W}" height="${H}" fill="url(#grid-fade)"/>
    </mask>

    <!-- Continuous lime → blue → dark ramp shared by every mesh bar; spans
         each bar's own height (objectBoundingBox) so there are no seams. A
         thin lime crown gives way quickly to the dominant blue body. -->
    <linearGradient id="mesh" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a4ea4e"/>
      <stop offset="28%" stop-color="#36a0ef"/>
      <stop offset="60%" stop-color="#2f7fff"/>
      <stop offset="92%" stop-color="#040b1c"/>
    </linearGradient>

    <!-- Heavy blur fuses the discrete bars into one soft triangle of glow,
         then saturate keeps the lime/blue vivid through the blur (mirrors the
         site's saturate(135%)). -->
    <filter id="mesh-blur" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="38"/>
      <feColorMatrix type="saturate" values="1.5"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${PAGE_BG}"/>

  <!-- Blueprint grid (faded from the top) -->
  <g mask="url(#grid-mask)">
    <rect width="${W}" height="${H}" fill="url(#grid-minor)"/>
    <rect width="${W}" height="${H}" fill="url(#grid-major)"/>
  </g>

  <!-- Bottom mesh triangle (sits behind the type so the copy stays crisp) -->
  <g filter="url(#mesh-blur)" opacity="0.62">${bars}</g>

  <!-- Dashed editorial frame -->
  <rect x="40" y="40" width="${W - 80}" height="${H - 80}"
        fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5"
        stroke-dasharray="6 7"/>

  <g font-family="'Space Mono', ui-monospace, Menlo, monospace" fill="#ffffff">
    <!-- Eyebrow -->
    <text x="80" y="150" font-size="24" font-weight="700"
          letter-spacing="6" fill="rgba(255,255,255,0.62)">
      PRODUCT &amp; SOFTWARE ENGINEER
    </text>

    <!-- Name -->
    <text x="76" y="300" font-size="118" font-weight="700" letter-spacing="-4">
      GABRIEL
    </text>
    <text x="76" y="420" font-size="118" font-weight="700" letter-spacing="-4">
      MOUALLEM
    </text>

    <!-- Hairline rule -->
    <line x1="80" y1="478" x2="${W - 80}" y2="478"
          stroke="rgba(255,255,255,0.25)" stroke-width="1"/>

    <!-- Skills line -->
    <text x="80" y="522" font-size="25" font-weight="400"
          fill="rgba(255,255,255,0.82)">
      React · Next.js · Node.js · Python · Kubernetes · Cloud Native
    </text>

    <!-- Sourcing line -->
    <text x="80" y="560" font-size="22" font-weight="400"
          letter-spacing="2" fill="rgba(255,255,255,0.55)">
      REMOTE · CONTRACT · LATAM (BRAZIL)
    </text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
console.log(`wrote ${out}`);
