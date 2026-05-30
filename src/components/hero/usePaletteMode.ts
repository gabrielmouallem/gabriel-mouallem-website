import { useCallback, useEffect, useRef, useState } from "react";
import { PALETTE_STORAGE_KEY } from "./constants";

/** The resolved palette actually painted on the page. */
export type PaletteMode = "light" | "dark";
/** The user's stored choice — `system` defers to the OS preference. */
export type PalettePreference = "light" | "dark" | "system";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function isPreference(v: string | null | undefined): v is PalettePreference {
  return v === "light" || v === "dark" || v === "system";
}

function systemMode(): PaletteMode {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/** Collapse a preference into the concrete mode the page should render. */
function resolve(pref: PalettePreference): PaletteMode {
  return pref === "system" ? systemMode() : pref;
}

/**
 * Palette controller. Behaviour:
 *   • Default dark — with no stored choice the page is dark regardless of the
 *     OS `prefers-color-scheme`.
 *   • Three explicit choices — `light`, `dark`, or `system` (follow the OS).
 *     The selection is persisted and survives reloads; the inline head script
 *     reads it back and resolves it before first paint (no flash).
 * This hook hydrates from the attribute that script set, tracks the user's
 * preference for the segmented toggle, and keeps the resolved mode in sync —
 * including live OS changes while on `system` and across browser tabs.
 */
export function usePaletteMode() {
  const [preference, setPreference] = useState<PalettePreference>("dark");
  const preferenceRef = useRef(preference);
  preferenceRef.current = preference;
  const [mode, setMode] = useState<PaletteMode>("dark");

  const applyMode = useCallback((next: PaletteMode) => {
    setMode(next);
    document.documentElement.dataset.paletteMode = next;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", next === "light" ? "#e9e6df" : "#020308");
  }, []);

  // Hydrate the stored preference and resolve it to a concrete mode. (The
  // inline script already painted the right mode; this aligns React state.)
  useEffect(() => {
    let pref: PalettePreference = "dark";
    try {
      const stored = localStorage.getItem(PALETTE_STORAGE_KEY);
      if (isPreference(stored)) pref = stored;
    } catch {
      /* storage unavailable (private mode) — fall back to dark */
    }
    setPreference(pref);
    applyMode(resolve(pref));
  }, [applyMode]);

  // Follow the OS preference live while the choice is `system`.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = () => {
      if (preferenceRef.current === "system")
        applyMode(mql.matches ? "dark" : "light");
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [applyMode]);

  // Keep other tabs in sync when the stored choice changes (or is cleared
  // → back to the dark default).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PALETTE_STORAGE_KEY) return;
      const pref = isPreference(e.newValue) ? e.newValue : "dark";
      setPreference(pref);
      applyMode(resolve(pref));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyMode]);

  const choosePreference = useCallback(
    (next: PalettePreference) => {
      setPreference(next);
      applyMode(resolve(next));
      try {
        localStorage.setItem(PALETTE_STORAGE_KEY, next);
      } catch {
        /* storage unavailable (private mode) — non-fatal */
      }
    },
    [applyMode],
  );

  return { mode, preference, choosePreference };
}
