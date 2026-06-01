import { SITE } from "../../data/site";
import { withBase } from "../../lib/base";

interface Props {
  /** True once the scroll has entered the experience timeline phase. */
  inTimeline: boolean;
}

export function HeroTitle({ inTimeline }: Props) {
  return (
    <div
      className="hero-title"
      style={{
        opacity: inTimeline ? 0 : 0.9,
        transform: `translateY(${inTimeline ? -2 : 0}vh)`,
      }}
      aria-hidden={inTimeline ? "true" : undefined}
    >
      {/* Self-referencing home link: the brand doubles as the homepage's one
          internal inlink so the canonical URL isn't left orphaned. The title
          container is pointer-events:none (so it never blocks the scroll
          stage); the anchor re-enables them, but only while it's visible. */}
      <a
        className="hero-title-link"
        href={withBase("/")}
        aria-label={`${SITE.name} — home`}
        style={{ pointerEvents: inTimeline ? "none" : "auto" }}
        tabIndex={inTimeline ? -1 : undefined}
      >
        <div className="hero-line hero-line-1">
          I<span className="apos">&rsquo;</span>M
        </div>
        <div className="hero-line hero-line-2">
          <span className="hero-line-fragment">GABRIEL</span>
          <span className="hero-line-fragment">
            M<span className="hero-dot">.</span>
          </span>
        </div>
      </a>
    </div>
  );
}
