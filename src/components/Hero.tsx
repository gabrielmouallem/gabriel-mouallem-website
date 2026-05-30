import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { experiences } from "../data/experiences";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const MARQUEE_TEXT =
  "product & software engineer  —  full-stack  —  kubernetes  —  cloud native  —  ";

const HERO_PHASE_END = 0.06;

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  const [progress, setProgress] = useState(0);
  const [compact, setCompact] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const wrapper = wrapperRef.current;
    const stage = stageRef.current;
    if (!wrapper || !stage) return;

    const N = experiences.length;
    const heroEnd = HERO_PHASE_END;

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "+=700%",
        pin: stage,
        pinSpacing: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => setProgress(self.progress),
        snap: {
          snapTo: (value) => {
            if (value < heroEnd * 0.45) return 0;
            if (value < heroEnd) return heroEnd;
            const tp = (value - heroEnd) / (1 - heroEnd);
            const idx = Math.round(tp * (N - 1));
            return heroEnd + (idx / (N - 1)) * (1 - heroEnd);
          },
          duration: { min: 0.18, max: 0.45 },
          delay: 0.08,
          ease: "power2.inOut",
        },
      });
    }, wrapperRef);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
      stRef.current = null;
    };
  }, []);

  // DOM measurement: detect when labels would overlap and switch to compact
  // mode (hide inactive labels). This is the foundation for mobile.
  useEffect(() => {
    const container = timelineRef.current;
    if (!container) return;

    const compute = () => {
      const w = container.clientWidth;
      const N = experiences.length;
      const spacing = w / (N - 1);
      const widths = labelRefs.current.map((el) => el?.offsetWidth ?? 0);
      const maxLabelW = widths.length ? Math.max(...widths) : 0;
      setCompact(maxLabelW > spacing * 0.78);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(container);
    const fontReadyTimer = window.setTimeout(compute, 250);
    return () => {
      ro.disconnect();
      window.clearTimeout(fontReadyTimer);
    };
  }, []);

  const N = experiences.length;
  // Hysteresis: once progress crosses half of the hero phase, treat it as
  // "in timeline" even if scrub momentarily dips below HERO_PHASE_END. The
  // snap zones already pull the user firmly to either 0 or heroEnd, so the
  // threshold at heroEnd*0.5 sits inside the larger snap zone and prevents
  // the idx-0 ↔ hero flicker on small mouse-wheel bumps at the boundary.
  const inTimeline = progress >= HERO_PHASE_END * 0.5;
  const tp = inTimeline
    ? (progress - HERO_PHASE_END) / (1 - HERO_PHASE_END)
    : 0;
  const activeIdx = inTimeline
    ? Math.min(N - 1, Math.round(tp * (N - 1)))
    : -1;

  const heroAttenuation = Math.min(1, Math.max(0, progress / HERO_PHASE_END));

  const scrollToIndex = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    const targetProgress =
      HERO_PHASE_END + (i / (N - 1)) * (1 - HERO_PHASE_END);
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    gsap.to(window, {
      scrollTo: targetScroll,
      duration: 0.65,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  // Keep the latest activeIdx in a ref so the keydown listener (mounted
  // once) always reads the current value without re-binding.
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept when the user is typing in an input/textarea/etc.
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
        return;
      }
      const cur = activeIdxRef.current;
      if (cur < 0) return; // only navigate once we're in the timeline
      let next: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = Math.min(N - 1, cur + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = Math.max(0, cur - 1);
      }
      if (next !== null && next !== cur) {
        e.preventDefault();
        scrollToIndex(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // scrollToIndex closes over refs only, so once is fine
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={wrapperRef} className="hero-wrapper">
      <div ref={stageRef} className="hero-stage">
        <Marquee />
        <PlusCluster />

        <div
          className="hero-title"
          style={{
            opacity: inTimeline ? 0.08 : 1 - heroAttenuation * 0.05,
            transform: `translateY(${inTimeline ? -2 : 0}vh)`,
          }}
          aria-hidden={inTimeline ? "true" : undefined}
        >
          <div className="hero-line hero-line-1" data-text="I’M">
            I<span className="apos">&rsquo;</span>M
          </div>
          <div className="hero-line hero-line-2" data-text="GABRIEL">
            GABRIEL
          </div>
        </div>

        <div
          className="exp-panels"
          style={{
            opacity: activeIdx >= 0 ? 1 : 0,
            transform: `translateY(${activeIdx >= 0 ? 0 : 10}px)`,
          }}
          aria-live="polite"
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

        <Arrow />
        <Logo />

        <div
          ref={timelineRef}
          className="timeline"
          data-compact={compact ? "true" : "false"}
        >
          <div className="timeline-grid">
            {experiences.map((exp, i) => {
              const isActive = activeIdx === i;
              const isPast = i < activeIdx;
              return (
                <button
                  key={i}
                  type="button"
                  className="timeline-col"
                  data-active={isActive ? "true" : "false"}
                  data-past={isPast ? "true" : "false"}
                  data-first={i === 0 ? "true" : "false"}
                  data-last={i === N - 1 ? "true" : "false"}
                  style={{ left: `${(i / (N - 1)) * 100}%` }}
                  onClick={() => scrollToIndex(i)}
                  aria-label={`Jump to ${exp.company}`}
                >
                  <div
                    className="timeline-label"
                    ref={(el) => {
                      labelRefs.current[i] = el;
                    }}
                  >
                    <div className="timeline-idx">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="timeline-name">{exp.shortLabel}</div>
                    <div className="timeline-years">
                      {extractYears(exp.dates)}
                    </div>
                  </div>
                  <div className="timeline-line" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="scroll-hint" style={{ opacity: inTimeline ? 0 : 1 }}>
          scroll or click to walk through 7 years
        </div>
      </div>
    </div>
  );
}

function extractYears(dates: string): string {
  const m = dates.match(/(\d{4}).*?(\d{4}|Present)/);
  if (!m) return dates;
  return `${m[1]}—${m[2] === "Present" ? "now" : m[2]}`;
}

function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i}>{MARQUEE_TEXT}</span>
        ))}
      </div>
    </div>
  );
}

function PlusCluster() {
  return (
    <div className="plus-cluster" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i}>+</span>
      ))}
    </div>
  );
}

function Arrow() {
  return (
    <svg
      className="arrow"
      viewBox="0 0 100 100"
      width="86"
      height="86"
      aria-hidden="true"
    >
      <path
        d="M 18 82 L 78 22"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        fill="none"
      />
      <path
        d="M 78 22 L 38 22 M 78 22 L 78 62"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}

function Logo() {
  return (
    <div className="logo" aria-label="Gabriel Mouallem">
      <span className="logo-mark">GM</span>
      <span className="logo-dot">.</span>
      <span className="logo-name">MOUALLEM</span>
    </div>
  );
}
