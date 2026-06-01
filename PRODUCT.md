# Product

## Register

brand

## Users

Hiring managers, founders, and engineering leads at US and international teams
who land on the site from LinkedIn, a referral, or a CV link, usually on first
contact and often on mobile. They spend 20-60 seconds deciding whether Gabriel
is worth a reply. Their job-to-be-done: gauge seniority and range fast, then
grab the CV or a contact channel. Secondary audience: recruiters sourcing
LATAM / nearshore / contract engineers via search.

## Product Purpose

A single-page personal site for Gabriel Mouallem, a senior Product & Software
Engineer (Brazil / LATAM, remote + contract). It presents ~7 years of
experience as a scroll-driven, walkable timeline and routes the visitor to the
CV, email, LinkedIn, or GitHub. Success = the visitor comes away with a clear
read on seniority and breadth, and takes one action (download CV or reach out).
The design itself is evidence of craft, so it carries as much weight as the copy.

## Brand Personality

Editorial, precise, confident, a little playful. Voice is plain and specific,
not salesy. Three words: **crafted, exacting, understated**. The interface
should feel like the work of someone who sweats alignment and restraint, with
small human touches (handwritten annotations, a "press start" scroll prompt)
that keep it from feeling clinical. Emotional goal: quiet authority. The visitor
should trust the hands before reading a single bullet.

## Anti-references

- **Generic SaaS landing**: card grids, hero-metric blocks, tiny tracked
  eyebrows above every section, gradient text.
- **Cookie-cutter dev portfolio**: template themes, project-card walls,
  skill-bar percentages, a centered "Hi, I'm X" hero.
- **Loud / over-animated**: bounce/elastic easing, parallax everywhere, neon
  glassmorphism, motion for its own sake.
- **Corporate / safe**: stock photography, navy-and-gray restraint, no point of
  view.

## Design Principles

1. **Grid rigor over arbitrary landmarks.** Reason from the 6-column module and
   size-invariant units (vw, em, clamp), not golden-ratio pixel tweaks. Every
   structural edge (nav, title, timeline, mesh) shares the 4.5vw gutter.
2. **One source of truth.** Identity, copy, and theme each live in exactly one
   place (`site.ts`, the token blocks). Components read tokens; they never
   branch on palette mode.
3. **Show the craft, don't narrate it.** The page demonstrates seniority through
   execution rather than claiming it. Copy stays specific and sparse.
4. **Restraint carries the color.** A near-monochrome field with two committed
   accents (lime + mesh blue). Color appears where it means something, never as
   decoration.
5. **Motion is structural, never garnish.** The scroll timeline IS the
   navigation. Easing is exponential ease-out; reduced-motion gets a real
   linear-document fallback, not a dead page.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**. Body text contrast >=4.5:1 and large text >=3:1 in both
palettes; a visually-hidden semantic `<h1>` + intro backs the stylized visual
hero for crawlers and screen readers. Full keyboard navigation of the timeline
(arrow keys + focusable columns), visible focus states, `prefers-reduced-motion`
and `prefers-contrast: more` honored, and the About dialog exposed with proper
`role="dialog"` / `aria-modal` semantics.
