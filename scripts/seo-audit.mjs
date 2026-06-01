/**
 * Free, Ahrefs-style SEO audit for the *built* static site.
 *
 * Parses every HTML file under `dist/`, reconstructs the internal link graph,
 * and asserts the same rules a Site Audit crawler checks — most importantly
 * the one Ahrefs flagged for gabrielm.dev:
 *
 *   "Canonical URL has no incoming internal links"
 *
 * Because the site is statically rendered, the build is the source of truth:
 * no paid plan, no network, fully deterministic, CI-friendly.
 *
 * Run with: `node scripts/seo-audit.mjs` (or `npm run audit`, which builds first).
 * Exits non-zero if any ERROR-level issue is found, so it can gate CI.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

// Must match `site` in astro.config.mjs.
const ORIGIN = "https://gabrielm.dev";

// Soft length guidance (Google SERP truncation ballparks).
const TITLE_MAX = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

if (!existsSync(dist)) {
  console.error(`✗ No build found at ${dist}. Run \`npm run build\` first.`);
  process.exit(1);
}

// ── Collect every .html file in the build ────────────────────────────────
/** @param {string} dir @returns {string[]} */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Map a built HTML file path to the URL pathname it serves. */
function fileToPathname(file) {
  let rel = path.relative(dist, file).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  // Bare `foo.html` → `/foo`
  return "/" + rel.replace(/\.html$/, "");
}

/** Normalise a URL to "ORIGIN + pathname" (drop hash, query, trailing index). */
function canonicalizeUrl(raw, base) {
  let u;
  try {
    u = new URL(raw, base);
  } catch {
    return null;
  }
  if (u.origin !== ORIGIN) return null; // external
  let p = u.pathname.replace(/index\.html$/, "");
  if (p === "") p = "/";
  return ORIGIN + p;
}

/** Decode the handful of HTML entities Astro emits so length checks reflect
 * the *displayed* text (Google measures rendered chars, e.g. `&amp;` = 1). */
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&rsquo;|&#8217;/g, "\u2019")
    .replace(/&nbsp;/g, " ");
}

const attr = (html, re) => {
  const m = html.match(re);
  return m ? decodeEntities(m[1].trim()) : null;
};

const files = walk(dist);

/**
 * @type {Map<string, {
 *   url: string, file: string, title: string|null, description: string|null,
 *   canonical: string|null, indexable: boolean,
 *   hrefInlinks: number, canonicalInlinks: number,
 * }>}
 */
const pages = new Map();

// First pass — index every page by its served URL.
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const pathname = fileToPathname(file);
  const url = ORIGIN + pathname;

  const canonicalRaw = attr(
    html,
    /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  ) ?? attr(
    html,
    /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i,
  );

  const robots = (attr(html, /<meta[^>]+name=["']robots["'][^>]*content=["']([^"']+)["']/i) ?? "").toLowerCase();

  pages.set(url, {
    url,
    file: path.relative(root, file),
    title: attr(html, /<title[^>]*>([^<]*)<\/title>/i),
    description: attr(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i),
    canonical: canonicalRaw ? canonicalizeUrl(canonicalRaw, url) : null,
    indexable: !robots.includes("noindex"),
    hrefInlinks: 0,
    canonicalInlinks: 0,
  });
}

// Second pass — walk every <a href> and build the internal link graph.
/** @type {{from: string, to: string}[]} */
const brokenLinks = [];

for (const file of files) {
  const html = readFileSync(file, "utf8");
  const fromUrl = ORIGIN + fileToPathname(file);

  for (const m of html.matchAll(/<a\b[^>]*\shref=["']([^"']*)["'][^>]*>/gi)) {
    const raw = m[1].trim();
    // Skip on-page anchors, mailto/tel, and other schemes — Ahrefs doesn't
    // count these as internal page inlinks.
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(raw)) continue;

    const target = canonicalizeUrl(raw, fromUrl);
    if (!target) continue; // external link

    const targetPage = pages.get(target);
    if (!targetPage) {
      // Internal link whose destination isn't an HTML page in the build.
      // Ignore static asset downloads (have a file extension), flag the rest.
      if (!/\.[a-z0-9]{1,8}$/i.test(new URL(target).pathname)) {
        brokenLinks.push({ from: fromUrl, to: target });
      }
      continue;
    }

    targetPage.hrefInlinks += 1;
    if (targetPage.canonical && targetPage.canonical === target) {
      targetPage.canonicalInlinks += 1;
    }
  }
}

// ── Evaluate the rules ────────────────────────────────────────────────────
/** @type {{level: "ERROR"|"WARN", code: string, url: string, msg: string}[]} */
const issues = [];
const err = (code, url, msg) => issues.push({ level: "ERROR", code, url, msg });
const warn = (code, url, msg) => issues.push({ level: "WARN", code, url, msg });

for (const p of pages.values()) {
  if (!p.canonical) {
    warn("no-canonical", p.url, "Page has no <link rel=canonical>.");
  } else if (p.indexable && p.canonicalInlinks === 0) {
    // The exact Ahrefs issue.
    err(
      "canonical-no-inlinks",
      p.url,
      `Canonical URL has no incoming internal links (href inlinks: ${p.hrefInlinks}, canonical inlinks: 0).`,
    );
  }

  // A link points to this URL, but the page canonicalises elsewhere → the
  // links should target the canonical instead ("links to non-canonical versions").
  if (p.canonical && p.canonical !== p.url && p.hrefInlinks > 0) {
    warn(
      "links-to-non-canonical",
      p.url,
      `${p.hrefInlinks} internal link(s) point here, but it canonicalises to ${p.canonical}.`,
    );
  }

  if (!p.title) err("no-title", p.url, "Missing <title>.");
  else if (p.title.length > TITLE_MAX)
    warn("title-length", p.url, `Title is ${p.title.length} chars (> ${TITLE_MAX} may truncate in SERPs).`);

  if (!p.description) warn("no-description", p.url, "Missing meta description.");
  else if (p.description.length < DESC_MIN || p.description.length > DESC_MAX)
    warn("description-length", p.url, `Meta description is ${p.description.length} chars (aim for ${DESC_MIN}–${DESC_MAX}).`);
}

for (const b of brokenLinks)
  err("broken-internal-link", b.from, `Internal link to ${b.to} has no matching page in the build.`);

// ── Cross-check the sitemap against the build ──────────────────────────────
const sitemapFile = ["sitemap-0.xml", "sitemap-index.xml"]
  .map((f) => path.join(dist, f))
  .find((f) => existsSync(f));

if (sitemapFile) {
  const xml = readFileSync(sitemapFile, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = canonicalizeUrl(m[1], ORIGIN);
    if (loc && loc.endsWith(".xml")) continue; // nested sitemap index
    if (loc && !pages.has(loc))
      warn("sitemap-orphan", loc, "URL is in the sitemap but not in the build.");
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\nSEO audit — ${pages.size} page(s) in ${path.relative(root, dist)}\n`);

for (const p of pages.values()) {
  console.log(
    `  ${p.url}\n` +
      `    canonical: ${p.canonical ?? "—"}  |  href inlinks: ${p.hrefInlinks}  |  canonical inlinks: ${p.canonicalInlinks}  |  ${p.indexable ? "indexable" : "noindex"}`,
  );
}

const errors = issues.filter((i) => i.level === "ERROR");
const warns = issues.filter((i) => i.level === "WARN");

if (issues.length === 0) {
  console.log("\n✓ No issues found.\n");
  process.exit(0);
}

console.log("");
for (const i of issues)
  console.log(`  [${i.level}] ${i.code} — ${i.url}\n          ${i.msg}`);

console.log(`\n${errors.length} error(s), ${warns.length} warning(s).\n`);
process.exit(errors.length > 0 ? 1 : 0);
