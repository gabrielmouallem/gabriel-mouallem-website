import { useEffect } from "react";
import { experiences } from "../../data/experiences";

interface Params {
  activeIdx: number;
  aboutOpen: boolean;
  onOpenAbout: () => void;
  scrollTo: (i: number) => void;
}

/**
 * Two-way #hash deep-linking.
 *
 * Read (mount only):
 *   #about      → open modal (no scroll)
 *   #<slug>     → scroll to that experience
 *   no hash     → home / current
 *
 * Write (on state change): mirror the current state back into the hash via
 * `history.replaceState` (no new history entries). `#about` takes priority
 * over whatever experience the scroll is on.
 */
export function useHashDeepLink({
  activeIdx,
  aboutOpen,
  onOpenAbout,
  scrollTo,
}: Params) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!hash) return;
    if (hash === "about") {
      onOpenAbout();
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
}
