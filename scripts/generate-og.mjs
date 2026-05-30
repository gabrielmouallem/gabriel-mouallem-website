/**
 * Generates the 1200×630 social-share card (public/og-image.png) used by the
 * Open Graph / Twitter tags. Editorial dark treatment that echoes the site:
 * monospace type, hard corners, a dashed frame and a hairline rule.
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

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a18"/>
      <stop offset="100%" stop-color="#05050d"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

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
