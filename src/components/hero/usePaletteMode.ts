import { useCallback, useEffect, useRef, useState } from "react";
import { PALETTE_STORAGE_KEY } from "./constants";

export type PaletteMode = "light" | "dark";

/**
 * Palette-mode controller. Behaviour:
 *   • Default dark — with no stored choice the page is dark regardless of
 *     the OS `prefers-color-scheme`.
 *   • Persist — an explicit toggle is written to localStorage and survives
 *     reloads (the inline head script reads it back before first paint).
 * The inline script is the source of truth on first paint (no flash); this
 * hook hydrates from the attribute it set and then keeps everything in sync.
 */
export function usePaletteMode() {
  const [mode, setMode] = useState<PaletteMode>("dark");
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const applyMode = useCallback((next: PaletteMode, persist: boolean) => {
    setMode(next);
    document.documentElement.dataset.paletteMode = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", next === "light" ? "#e9e6df" : "#020308");
    if (persist) {
      try {
        localStorage.setItem(PALETTE_STORAGE_KEY, next);
      } catch {
        /* storage unavailable (private mode) — non-fatal */
      }
    }
  }, []);

  // Hydrate from the attribute the inline script already resolved.
  useEffect(() => {
    const current = document.documentElement.dataset.paletteMode;
    if (current === "light" || current === "dark") setMode(current);
  }, []);

  // Keep other tabs in sync when the stored choice changes (or is cleared
  // → back to the dark default).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PALETTE_STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        applyMode(e.newValue, false);
      } else {
        applyMode("dark", false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyMode]);

  const toggleMode = useCallback(() => {
    applyMode(modeRef.current === "dark" ? "light" : "dark", true);
  }, [applyMode]);

  return { mode, toggleMode };
}
