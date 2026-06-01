import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Locks page scroll while `locked` is true WITHOUT the `position: fixed` body
 * trick. That trick resets scrollY and, on a ScrollTrigger-pinned page,
 * corrupts the pin's measured geometry so the timeline jumps when the modal
 * closes. Instead:
 *
 *   1. Disable GSAP's scroll normaliser (if active) so it stops driving the
 *      window on the JS thread while the overlay is up.
 *   2. overflow:hidden on <html> + pad for the missing scrollbar so desktop
 *      content doesn't shift.
 *   3. Intercept touchmove and preventDefault — EXCEPT inside an element
 *      flagged [data-scroll-lock-scrollable] — because iOS Safari still pans
 *      the page behind a fixed overlay even with overflow:hidden. Scoping the
 *      guard to the flagged subtree keeps the modal itself scrollable.
 *
 * Nothing here moves the document, so the pin stays put and there's no scroll
 * position to restore.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return;

    const html = document.documentElement;
    const body = document.body;

    // Pause the JS-thread scroll takeover so it doesn't fight the lock.
    const normalizer = ScrollTrigger.normalizeScroll();
    normalizer?.disable();

    // Reserve the scrollbar's width so hiding overflow doesn't shift layout
    // (desktop). 0 on overlay-scrollbar platforms and mobile.
    const scrollbarW = window.innerWidth - html.clientWidth;
    const prevOverflow = html.style.overflow;
    const prevPadding = body.style.paddingRight;

    html.style.overflow = "hidden";
    if (scrollbarW > 0) {
      const base = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${base + scrollbarW}px`;
    }

    const onTouchMove = (e: TouchEvent) => {
      const target = e.target as Element | null;
      // Allow the gesture only when it starts inside a flagged scrollable
      // region (the modal body); block everything else so the page behind
      // can't pan on iOS.
      if (target && target.closest("[data-scroll-lock-scrollable]")) return;
      e.preventDefault();
    };
    // Non-passive so preventDefault is honoured.
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      html.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      normalizer?.enable();
    };
  }, [locked]);
}
