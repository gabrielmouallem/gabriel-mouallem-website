interface Props {
  /** True once the scroll has entered the experience timeline phase. */
  inTimeline: boolean;
  /** 0 → 1 progress through the hero phase, used to fade the title out. */
  heroAttenuation: number;
}

export function HeroTitle({ inTimeline, heroAttenuation }: Props) {
  return (
    <div
      className="hero-title"
      style={{
        opacity: inTimeline ? 0 : 1 - heroAttenuation * 0.05,
        transform: `translateY(${inTimeline ? -2 : 0}vh)`,
      }}
      aria-hidden={inTimeline ? "true" : undefined}
    >
      <div className="hero-line hero-line-1" data-text="I’M">
        I<span className="apos">&rsquo;</span>M
      </div>
      <div className="hero-line hero-line-2">
        <span className="hero-line-fragment" data-text="GABRIEL">
          GABRIEL
        </span>
        <span className="hero-line-fragment" data-text="M.">M.</span>
      </div>
    </div>
  );
}
