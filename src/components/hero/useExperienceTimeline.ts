import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { experiences } from "../../data/experiences";
import { HERO_PHASE_END } from "./constants";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/**
 * Owns the pinned-scroll experience timeline. The continuous scroll progress
 * is intentionally kept OUT of React state — only the two discrete values the
 * view needs (the phase flag + the active index) are committed, and only when
 * they change — so the scrub never re-renders the hero tree. (The per-frame
 * setState that used to push raw progress was what starved the main thread and
 * froze the scroll on mobile.)
 */
export function useExperienceTimeline() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const stRef = useRef<ScrollTrigger | null>(null);

  const [inTimeline, setInTimeline] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [compact, setCompact] = useState(false);

  // Last-committed discrete values, compared on every frame inside onUpdate so
  // we can bail before ever calling a setter when nothing actually changed.
  const lastInRef = useRef(false);
  const lastIdxRef = useRef(-1);

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

    // Skip ScrollTrigger refreshes caused purely by the mobile URL-bar
    // show/hide (which only changes viewport HEIGHT). On iOS — portrait
    // especially — that resize fires repeatedly while scrolling, and a full
    // refresh() mid-scroll is exactly what makes a pinned timeline lurch.
    // Genuine resizes (orientation, desktop window) still refresh. Set here
    // (client-only) rather than at module scope so it doesn't run during SSR.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Touch-PRIMARY devices only (phones/tablets, no mouse). Hands scrolling to
    // the JS thread: keeps the viewport height constant, kills the rubber-band
    // overscroll, and syncs repaints with the pin so it stops jumping. Left OFF
    // for mouse + hybrid devices so desktop wheel feel stays fully native.
    const touchPrimary = ScrollTrigger.isTouch === 1;
    if (touchPrimary) ScrollTrigger.normalizeScroll(true);

    const ctx = gsap.context(() => {
      stRef.current = ScrollTrigger.create({
        trigger: wrapper,
        start: "top top",
        end: "+=700%",
        pin: stage,
        pinSpacing: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const nextIn = p >= heroEnd * 0.5;
          const tp = nextIn ? (p - heroEnd) / (1 - heroEnd) : 0;
          const nextIdx = nextIn
            ? Math.min(N - 1, Math.max(0, Math.round(tp * (N - 1))))
            : -1;

          // Cheap ref compare every frame; setState only at the ~8 boundaries.
          if (nextIn !== lastInRef.current) {
            lastInRef.current = nextIn;
            setInTimeline(nextIn);
          }
          if (nextIdx !== lastIdxRef.current) {
            lastIdxRef.current = nextIdx;
            setActiveIdx(nextIdx);
          }
        },
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

    return () => {
      ctx.revert();
      stRef.current = null;
      if (touchPrimary) ScrollTrigger.normalizeScroll(false);
    };
  }, []);

  // DOM measurement: detect when labels would overlap and switch to compact
  // mode (hide inactive labels). Independent of scroll — only fires on resize.
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

  // Keep the latest activeIdx in a ref so the keydown listener (mounted once)
  // always reads the current value without re-binding.
  const activeIdxRef = useRef(activeIdx);
  activeIdxRef.current = activeIdx;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't drive the (possibly scroll-locked) timeline while a modal
      // dialog is open in front of it.
      if (document.querySelector('[aria-modal="true"]')) return;

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
    compact,
    scrollTo,
  };
}
