import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { experiences } from "../../data/experiences";
import { HERO_PHASE_END } from "./constants";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Owns the pinned-scroll experience timeline: the GSAP ScrollTrigger pin,
 * scroll progress, the derived active-experience index, the compact-label
 * measurement, programmatic scroll-to, and keyboard navigation.
 *
 * Exposes refs to attach to the wrapper/stage/timeline DOM plus the derived
 * presentational state so the view layer stays free of scroll mechanics.
 */
export function useExperienceTimeline() {
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

  return {
    wrapperRef,
    stageRef,
    timelineRef,
    labelRefs,
    inTimeline,
    activeIdx,
    heroAttenuation,
    compact,
    scrollTo,
  };
}
