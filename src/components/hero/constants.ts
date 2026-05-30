/**
 * Fraction of the pinned scroll spent on the hero title before the
 * experience timeline takes over. Shared by the ScrollTrigger snap math
 * and the derived `activeIdx` so both agree on the phase boundary.
 */
export const HERO_PHASE_END = 0.06;

/** localStorage key persisting the user's explicit light/dark choice. */
export const PALETTE_STORAGE_KEY = "palette-mode";

/** TEMP: localStorage key for the background-pattern A/B comparison. */
export const BG_STORAGE_KEY = "bg-pattern";
