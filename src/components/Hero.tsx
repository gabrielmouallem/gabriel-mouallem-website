import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { experiences } from "../data/experiences";

gsap.registerPlugin(ScrollTrigger);

const MARQUEE_TEXT =
  "product & software engineer  —  full-stack  —  kubernetes  —  cloud native  —  ";

const HERO_PHASE_END = 0.06;

export default function Hero() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);

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
      ScrollTrigger.create({
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
    };
  }, []);

  const N = experiences.length;
  const inTimeline = progress > HERO_PHASE_END;
  const tp = inTimeline
    ? (progress - HERO_PHASE_END) / (1 - HERO_PHASE_END)
    : 0;
  const activeIdx = inTimeline
    ? Math.min(N - 1, Math.round(tp * (N - 1)))
    : -1;

  const heroAttenuation = Math.min(1, Math.max(0, progress / HERO_PHASE_END));

  return (
    <div ref={wrapperRef} className="hero-wrapper">
      <div ref={stageRef} className="hero-stage">
        <Marquee />
        <PlusCluster />

        <div
          className="hero-title"
          style={{
            opacity: inTimeline ? 0.18 : 1 - heroAttenuation * 0.05,
            transform: `translateY(${inTimeline ? -2 : 0}vh)`,
          }}
          aria-hidden={inTimeline ? "true" : undefined}
        >
          <div className="hero-line hero-line-1">
            I<span className="apos">&rsquo;</span>M
          </div>
          <div className="hero-line hero-line-2">GABRIEL</div>
        </div>

        <div
          className="exp-panels"
          style={{
            opacity: inTimeline ? 1 : 0,
            transform: `translateY(${inTimeline ? 0 : 10}px)`,
          }}
          aria-live="polite"
        >
          {experiences.map((exp, i) => (
            <article
              key={i}
              className="exp-panel"
              data-active={activeIdx === i ? "true" : "false"}
            >
              <div className="exp-eyebrow">
                {String(i + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </div>
              <h2 className="exp-company">{exp.company}</h2>
              <div className="exp-role">{exp.role}</div>
              <div className="exp-meta">
                {exp.dates}
                {exp.location ? ` · ${exp.location}` : ""}
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

        <div className="timeline">
          <div className="timeline-grid">
            {experiences.map((exp, i) => {
              const isActive = activeIdx === i;
              const isPast = i < activeIdx;
              return (
                <div
                  key={i}
                  className="timeline-col"
                  data-active={isActive ? "true" : "false"}
                  data-past={isPast ? "true" : "false"}
                  style={{ left: `${(i / (N - 1)) * 100}%` }}
                >
                  <div className="timeline-label">
                    <div className="timeline-idx">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="timeline-name">{exp.shortLabel}</div>
                    <div className="timeline-years">
                      {extractYears(exp.dates)}
                    </div>
                  </div>
                  <div className="timeline-line" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="scroll-hint" style={{ opacity: inTimeline ? 0 : 1 }}>
          scroll to walk through 7 years
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
