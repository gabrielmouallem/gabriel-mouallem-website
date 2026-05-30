import { useCallback, useEffect, useState } from "react";

/**
 * About-modal open state plus the Escape-to-close shortcut. The listener is
 * only bound while the modal is open so it never competes with the
 * timeline's own keyboard navigation when closed.
 */
export function useAboutModal() {
  const [aboutOpen, setAboutOpen] = useState(false);

  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  useEffect(() => {
    if (!aboutOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAboutOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aboutOpen]);

  return { aboutOpen, openAbout, closeAbout };
}
