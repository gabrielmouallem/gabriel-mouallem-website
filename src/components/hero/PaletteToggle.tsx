import type { PaletteMode } from "./usePaletteMode";
import { MoonIcon, SunIcon } from "./icons";

/**
 * Sliding light/dark switch — sits in the top-right where the decorative
 * plus-cluster used to be. A pill track with a sun on the left and a moon
 * on the right; the filled knob slides to the active side and the icon it
 * covers flips to the contrast tone.
 */
export function PaletteToggle({
  mode,
  onToggle,
}: {
  mode: PaletteMode;
  onToggle: () => void;
}) {
  const isDark = mode === "dark";
  return (
    <button
      type="button"
      className="palette-toggle"
      data-mode={mode}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={onToggle}
    >
      <span className="palette-toggle-track" aria-hidden="true">
        <span className="palette-toggle-knob" />
        <span className="palette-toggle-icon palette-toggle-icon--sun">
          <SunIcon />
        </span>
        <span className="palette-toggle-icon palette-toggle-icon--moon">
          <MoonIcon />
        </span>
      </span>
    </button>
  );
}
