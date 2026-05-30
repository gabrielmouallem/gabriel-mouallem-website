/**
 * Prefix a root-absolute public path with the configured base path so links
 * resolve both at the domain root (base "/") and under a GitHub Pages
 * project sub-path (e.g. base "/gabriel-mouallem-website/").
 *
 * Vite rewrites asset URLs inside CSS automatically, but hardcoded paths in
 * `.astro`/`.tsx` markup (favicons, the résumé download) are not — route
 * those through here. Works in both the Astro server build and the React
 * client island because Vite inlines `import.meta.env.BASE_URL` everywhere.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
