import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { experiences } from "../data/experiences";
import { SITE } from "../data/site";

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

  /** Scroll to a specific experience index, or pass -1 to go home. */
  const scrollTo = (i: number) => {
    const st = stRef.current;
    if (!st) return;
    const targetProgress =
      i < 0 ? 0 : HERO_PHASE_END + (i / (N - 1)) * (1 - HERO_PHASE_END);
    const targetScroll = st.start + (st.end - st.start) * targetProgress;
    gsap.to(window, {
      scrollTo: targetScroll,
      duration: 0.65,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  };

  const scrollToIndex = (i: number) => scrollTo(i);

  // Keep the latest activeIdx in a ref so the keydown listener (mounted
  // once) always reads the current value without re-binding.
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't intercept when the user is typing in an input/textarea/etc.
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      const cur = activeIdxRef.current;
      // Navigation loop has N + 1 positions: home (-1) plus N experiences.
      //   ArrowRight: home → 0 → 1 → ... → N-1 → home → 0 ...
      //   ArrowLeft:  home → N-1 → N-2 → ... → 0 → home → N-1 ...
      let next: number | null = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        next = cur + 1;
        if (next >= N) next = -1; // wrap past last → home
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        next = cur - 1;
        if (next < -1) next = N - 1; // wrap past home → last
      }
      if (next !== null && next !== cur) {
        e.preventDefault();
        scrollTo(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- About modal ------------------------------------------------------
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen]);

  // --- Hash deep-linking ------------------------------------------------
  // Hash priority:
  //   #about      → open modal (no scroll)
  //   #<slug>     → scroll to that experience
  //   no hash     → home / current
  // On activeIdx OR aboutOpen change, we rewrite the hash to match current
  // state without creating new history entries.

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!hash) return;
    if (hash === "about") {
      setAboutOpen(true);
      return;
    }
    const idx = experiences.findIndex((e) => e.slug === hash);
    if (idx < 0) return;
    // Wait a tick so ScrollTrigger has measured the pin range.
    const t = window.setTimeout(() => scrollTo(idx), 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // About takes precedence — its hash overrides whatever experience
    // the scroll is on.
    if (aboutOpen) {
      history.replaceState(null, "", "#about");
      return;
    }
    if (activeIdx < 0) {
      // home — drop the hash without scrolling
      if (window.location.hash) {
        history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    } else {
      const slug = experiences[activeIdx]?.slug;
      if (slug) {
        history.replaceState(null, "", `#${slug}`);
      }
    }
  }, [activeIdx, aboutOpen]);

  return (
    <div ref={wrapperRef} className="hero-wrapper">
      <div ref={stageRef} className="hero-stage">
        <Nav onAbout={() => setAboutOpen(true)} />
        {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
        <PlusCluster />

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
              <h2 className="exp-company" data-text={exp.company}>
                {exp.company}
              </h2>
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

        <div
          className="scroll-hint"
          style={{ opacity: aboutOpen ? 0 : 1 }}
        >
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

const EMAIL_ADDRESS = SITE.email;

interface NavItemProps {
  idx: string;
  label: string;
  href?: string;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  ariaLabel?: string;
  /** Override the default `↗` icon (e.g. a copy icon for the email link). */
  icon?: React.ReactNode;
  iconClass?: string;
}

/**
 * Unified nav item — same `01 / LABEL ↗` shape whether it's a real <a>
 * (LinkedIn / GitHub / Email / etc.) or a <button> that opens a modal
 * (About). The clipping mask + idx serial + arrow are always identical
 * so every item reads the same.
 */
function NavItem({
  idx,
  label,
  href,
  external,
  onClick,
  ariaLabel,
  icon,
  iconClass,
}: NavItemProps) {
  const inner = (
    <>
      <span className="nav-idx" aria-hidden="true">
        {idx} /
      </span>
      <span className="nav-label" data-text={label}>
        {label}
      </span>
      <span className={`nav-arrow ${iconClass ?? ""}`.trim()} aria-hidden="true">
        {icon ?? "↗"}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        className="nav-link"
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        {...(external
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      className="nav-link nav-link--button"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {inner}
    </button>
  );
}

function Nav({ onAbout }: { onAbout: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleEmailClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      e.preventDefault();
      navigator.clipboard.writeText(EMAIL_ADDRESS).then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  return (
    <nav className="topnav" aria-label="Primary">
      <NavItem
        idx="01"
        label="About"
        onClick={onAbout}
        icon="+"
        iconClass="nav-arrow--plus"
      />
      <NavItem
        idx="02"
        label="LinkedIn"
        href={SITE.links.linkedin}
        external
      />
      <NavItem
        idx="03"
        label="GitHub"
        href={SITE.links.github}
        external
      />
      <NavItem
        idx="04"
        label={copied ? "Copied" : "Email"}
        href={`mailto:${EMAIL_ADDRESS}`}
        onClick={handleEmailClick}
        ariaLabel={
          copied
            ? "Email copied to clipboard"
            : `Copy email ${EMAIL_ADDRESS}`
        }
        icon={<CopyIcon />}
        iconClass="nav-arrow--copy"
      />
      <a
        className="nav-cta"
        href={SITE.links.resume}
        download={SITE.resumeFileName}
      >
        <span className="nav-cta-bracket" aria-hidden="true">[</span>
        <span className="nav-cta-label">Download Resume</span>
        <span className="nav-cta-arrow" aria-hidden="true">↓</span>
        <span className="nav-cta-bracket" aria-hidden="true">]</span>
      </a>
    </nav>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="12" height="12" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function About({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="about-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`About ${SITE.name}`}
      onClick={onClose}
    >
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="about-close"
          onClick={onClose}
          aria-label="Close about panel"
        >
          ×
        </button>

        <div className="about-grid">
          <section className="about-col">
            <h3 className="about-h">About</h3>
            <ul className="about-list">
              <li>Product/customer-oriented problem solver</li>
              <li>~7 years across IoT, AI/video, cloud infrastructure</li>
              <li>
                Currently on Stealth AI Company, hybrid from San Francisco
              </li>
              <li>Testing-first culture, BDD advocate</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Stack</h3>
            <ul className="about-list">
              <li>React / Next.js / TypeScript</li>
              <li>Python (Django, FastAPI, Flask)</li>
              <li>Node.js (Express, NestJS)</li>
              <li>Kubernetes / CloudNativePG</li>
              <li>React Native</li>
              <li>PostgreSQL / Redis / S3</li>
              <li>Jest, RTL, MSW, Storybook</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Contact</h3>
            <ul className="about-list">
              <li>
                <a
                  className="about-link"
                  href={`mailto:${EMAIL_ADDRESS}`}
                >
                  {EMAIL_ADDRESS}
                </a>
              </li>
              <li>Itajubá, Minas Gerais — Brazil</li>
              <li>Remote / SF Bay Area</li>
            </ul>
          </section>

          <section className="about-col">
            <h3 className="about-h">Connect</h3>
            <ul className="about-list">
              <li>
                <a
                  className="about-link"
                  href={SITE.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a
                  className="about-link"
                  href={SITE.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  className="about-link"
                  href={SITE.links.resume}
                  download={SITE.resumeFileName}
                >
                  Download CV ↓
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="about-monogram" aria-hidden="true">
          <span className="about-monogram-name">GABRIEL M.</span>
          <span className="about-monogram-fill" aria-hidden="true" />
        </div>

        <div className="about-subline" aria-hidden="true">
          Software &amp; Product Engineer
        </div>

        <p className="about-copy">
          © 2026 {SITE.name}. All rights reserved.
        </p>
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
    <div className="logo" aria-label={SITE.name}>
      <span className="logo-mark">{SITE.initials}</span>
      <span className="logo-dot">.</span>
      <span className="logo-name">{SITE.lastName.toUpperCase()}</span>
    </div>
  );
}
