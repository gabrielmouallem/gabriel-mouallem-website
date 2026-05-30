import { BG_PATTERNS, type BgPattern } from "./useBgPattern";

const LABELS: Record<BgPattern, string> = {
  graph: "Graph",
  dots: "Dots",
  lines: "Lines",
  none: "Off",
};

/**
 * TEMPORARY background-pattern picker — a tiny mono segmented control parked
 * under the palette toggle so we can compare the candidate textures live on
 * the page. Delete this (and useBgPattern + the CSS block + the inline head
 * resolver) once a winner is chosen.
 */
export function BgToggle({
  pattern,
  onChoose,
}: {
  pattern: BgPattern;
  onChoose: (next: BgPattern) => void;
}) {
  return (
    <div className="bg-toggle" role="group" aria-label="Background pattern (preview)">
      {BG_PATTERNS.map((p) => (
        <button
          key={p}
          type="button"
          className="bg-toggle-btn"
          data-active={pattern === p}
          aria-pressed={pattern === p}
          onClick={() => onChoose(p)}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  );
}
