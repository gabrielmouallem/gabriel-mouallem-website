import type { APIRoute } from "astro";
import { SITE } from "../data/site";
import { experiences } from "../data/experiences";

/**
 * `/llms.txt` — the llmstxt.org convention: a single Markdown file that gives
 * LLM crawlers a concise, curated map of the site without making them parse
 * the visual page. Generated from the same `site.ts` / `experiences.ts`
 * sources the page uses, so it never drifts from the real content.
 *
 * `prerender = true` makes Astro emit this as a static `/llms.txt` file at
 * build time (matching the otherwise-static output).
 */
export const prerender = true;

export const GET: APIRoute = () => {
  const origin = new URL(SITE.url).origin;

  const experienceLines = experiences
    .map((exp) => {
      const where = exp.location ? ` · ${exp.location}` : "";
      const summary = exp.bullets[0] ?? "";
      return `- **${exp.company}** — ${exp.role} (${exp.dates}${where}): ${summary}`;
    })
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.longDescription}

${SITE.name} is a ${SITE.title} based in ${SITE.location.city}, ${SITE.location.region}, ${SITE.location.country} (LATAM), available for remote and contract engagements with international teams.

## Contact

- Email: ${SITE.email}
- LinkedIn: ${SITE.links.linkedin}
- GitHub: ${SITE.links.github}
- Résumé (PDF): ${origin}${SITE.links.resume}

## Site

- [Home / Portfolio](${SITE.url}): single-page portfolio — bio, experience timeline, and contact.

## Experience

${experienceLines}

## Skills

${SITE.keywords.join(", ")}.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
