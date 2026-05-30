import { useCallback, useEffect, useState } from "react";
import { BG_STORAGE_KEY } from "./constants";

/**
 * TEMPORARY background-pattern A/B controller.
 *
 * Drives the `data-bg` attribute on <html>, which the CSS reads to paint the
 * full-bleed `body::before` grid. Lets us eyeball the candidate textures
 * (blueprint graph / dot matrix / single line grid / off) on the real page in
 * both palettes, then keep the winner and delete this scaffolding.
 *
 * The inline head script in index.astro resolves the stored choice before
 * first paint (no flash); this hook hydrates from the attribute it set.
 */
export const BG_PATTERNS = ["graph", "dots", "lines", "none"] as const;
export type BgPattern = (typeof BG_PATTERNS)[number];

const DEFAULT: BgPattern = "graph";

function isBgPattern(v: string | undefined | null): v is BgPattern {
  return (BG_PATTERNS as readonly string[]).includes(v ?? "");
}

export function useBgPattern() {
  const [pattern, setPattern] = useState<BgPattern>(DEFAULT);

  useEffect(() => {
    const current = document.documentElement.dataset.bg;
    if (isBgPattern(current)) setPattern(current);
  }, []);

  const choose = useCallback((next: BgPattern) => {
    setPattern(next);
    document.documentElement.dataset.bg = next;
    try {
      localStorage.setItem(BG_STORAGE_KEY, next);
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
  }, []);

  return { pattern, choose };
}
