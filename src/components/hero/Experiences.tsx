import { experiences } from "../../data/experiences";

/**
 * Handwritten-style notes that crossfade in on the right of the hero,
 * mirroring the active experience. Only experiences with an `annotation`
 * render a node.
 */
export function ExperienceAnnotations({ activeIdx }: { activeIdx: number }) {
  return (
    <div className="exp-annotations" aria-hidden="true">
      {experiences.map(
        (exp, i) =>
          exp.annotation && (
            <p
              key={i}
              className="exp-annotation"
              data-active={activeIdx === i ? "true" : "false"}
            >
              {exp.annotation}
            </p>
          ),
      )}
    </div>
  );
}

/** Stacked experience detail panels; the active one fades/slides in. */
export function ExperiencePanels({ activeIdx }: { activeIdx: number }) {
  const active = activeIdx >= 0 ? experiences[activeIdx] : null;
  return (
    <>
      {/* No aria-live here: all panels are always in the DOM, so this wrapper
          never actually mutates and can't carry an announcement. The active
          experience is announced by the dedicated status region below. */}
      <div
        className="exp-panels"
        style={{
          opacity: activeIdx >= 0 ? 1 : 0,
          transform: `translateY(${activeIdx >= 0 ? 0 : 10}px)`,
        }}
      >
        {experiences.map((exp, i) => (
          <article
            key={i}
            className="exp-panel"
            data-active={activeIdx === i ? "true" : "false"}
          >
            <h2 className="exp-company">{exp.company}</h2>
            <div className="exp-meta">
              <span className="exp-role">{exp.role}</span>
              <span className="exp-meta-sep"> · </span>
              <span className="exp-dates">
                {exp.dates}
                {exp.location ? ` · ${exp.location}` : ""}
              </span>
            </div>
            <ul className="exp-bullets">
              {exp.bullets.map((b, j) => (
                <li key={j}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {/* Visually-hidden live region that DOES mutate: it announces the
          experience the visitor scrolls / steps to, so screen-reader users
          perceive the timeline change (the panels above stay static in the
          DOM and can't trigger it themselves). */}
      <div className="sr-only" role="status" aria-live="polite">
        {active ? `Showing ${active.company}, ${active.role}` : ""}
      </div>
    </>
  );
}
