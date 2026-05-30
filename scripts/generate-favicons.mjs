/**
 * Rasterizes public/favicon.svg into the PNG icon fallbacks (32px favicon +
 * 180px apple-touch-icon) for browsers that don't render SVG <text> favicons.
 *
 * Run with: `node scripts/generate-favicons.mjs`.
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const svg = await fs.readFile(path.join(pub, "favicon.svg"));

const targets = [
  { size: 32, file: "favicon-32.png" },
  { size: 180, file: "apple-touch-icon.png" },
];

for (const { size, file } of targets) {
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(pub, file));
  console.log(`wrote public/${file} (${size}×${size})`);
}
