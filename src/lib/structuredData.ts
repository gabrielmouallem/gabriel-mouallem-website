import { SITE } from "../data/site";
import { experiences } from "../data/experiences";

/**
 * Build the schema.org `Person` JSON-LD that search engines use to populate
 * the knowledge panel and rich results. Everything is sourced from `SITE`
 * and the experience list so there's no duplicated copy to drift.
 *
 * `knowsAbout` doubles as a machine-readable keyword surface (skills +
 * sourcing terms like LATAM / nearshore / outsourcing) and `worksFor` is
 * derived from the real work history.
 */
export function buildPersonSchema() {
  const ogImageUrl = new URL(SITE.ogImage.replace(/^\//, ""), SITE.url).href;

  const employers = experiences
    .map((e) => e.company)
    .filter((c) => c && c.toLowerCase() !== "stealth");

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    givenName: SITE.firstName,
    familyName: SITE.lastName,
    jobTitle: SITE.title,
    description: SITE.longDescription,
    url: SITE.url,
    image: ogImageUrl,
    email: `mailto:${SITE.email}`,
    knowsAbout: [...SITE.keywords],
    knowsLanguage: ["en", "pt-BR"],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.location.city,
      addressRegion: SITE.location.region,
      addressCountry: SITE.location.countryCode,
    },
    worksFor: employers.map((name) => ({ "@type": "Organization", name })),
    sameAs: [SITE.links.linkedin, SITE.links.github],
  };
}

/** schema.org `WebSite` node so the domain itself is described for crawlers. */
export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${SITE.name} — ${SITE.title}`,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en",
    author: { "@type": "Person", name: SITE.name },
  };
}
