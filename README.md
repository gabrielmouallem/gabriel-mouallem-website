# Gabriel Mouallem — portfolio

Personal site for Gabriel Mouallem, Product & Software Engineer. A single,
scroll-driven Astro page with a React island for the experience timeline,
built to double as an SEO landing point for engineering / contract work.

- **Framework:** [Astro](https://astro.build) 6 (static output)
- **Island:** React 19 + [GSAP](https://gsap.com) ScrollTrigger for the pinned
  timeline
- **Fonts:** self-hosted via Fontsource (Space Mono, Caveat)
- **Deploy:** GitHub Pages via Actions (see `.github/workflows/deploy.yml`)

## Commands

| Command            | Action                                      |
| ------------------ | ------------------------------------------- |
| `bun install`      | Install dependencies                        |
| `bun dev`          | Dev server at `localhost:4321`              |
| `bun build`        | Build the static site to `./dist/`          |
| `bun preview`      | Preview the production build locally        |
| `bun run typecheck`| Type-check with `tsgo`                      |

## Project layout

```
public/                static assets (optimized textures, fonts pdf, robots.txt)
src/
  pages/index.astro    document head (SEO/meta/JSON-LD) + page shell
  components/Hero.tsx   React island; composes the hero from hero/* hooks+views
  data/                 site identity/SEO copy (site.ts) + work history
  lib/                  base-path helper + structured-data builders
  styles/global.css     all styling + theme tokens (light/dark)
scripts/                one-off asset generators (see below)
```

## Deployment & base path

`site` is `https://gabrielmouallem.github.io`. The project sub-path
(`/gabriel-mouallem-website`) is only applied when `ASTRO_BASE` is set, which
CI does — local dev/build stays at `/`. Use `withBase()` (`src/lib/base.ts`)
for any hardcoded public asset URL so links resolve in both modes.

## Asset pipeline

The page is a flat, solid-background design — all the decorative
scratch/flare/noise/film textures were removed, so `public/` only holds the
favicons, the social card, the résumé and `robots.txt`. The two generated
images are rebuilt with:

```sh
node scripts/generate-og.mjs        # public/og-image.png (1200×630)
node scripts/generate-favicons.mjs  # PNG icon fallbacks from favicon.svg
```

## SEO

`src/data/site.ts` is the single source of truth for title, description,
keywords and links; `src/lib/structuredData.ts` builds the schema.org
`Person`/`WebSite` JSON-LD. `@astrojs/sitemap` emits the sitemap and
`public/robots.txt` points crawlers at it.
