// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// The base path is only applied for the GitHub Pages *project* build, where
// CI sets ASTRO_BASE=/gabriel-mouallem-website. Local dev and root deploys
// stay at "/" so the dev server (which doesn't rewrite public/ asset URLs)
// keeps working. withBase() reads import.meta.env.BASE_URL, so links stay
// correct in both modes.
const base = process.env.ASTRO_BASE ?? '/';

// https://astro.build/config
export default defineConfig({
  site: 'https://gabrielmouallem.github.io',
  base,
  integrations: [react(), sitemap()],
});
