import { BG_PATTERNS, type BgPattern } from "./useBgPattern";
import { SegmentedControl, type SegmentOption } from "./SegmentedControl";

const LABELS: Record<BgPattern, string> = {
  graph: "Graph",
  dots: "Dots",
  lines: "Lines",
  none: "Off",
};

const OPTIONS: ReadonlyArray<SegmentOption<BgPattern>> = BG_PATTERNS.map((p) => ({
  value: p,
  label: LABELS[p],
}));

/**
 * TEMPORARY background-pattern picker — a mono segmented control parked under
 * the theme picker so we can compare the candidate textures live on the page.
 * Shares the `SegmentedControl` base with the theme picker. Delete this (and
 * useBgPattern + the CSS block + the inline head resolver) once a winner is
 * chosen.
 */
export function BgToggle({
  pattern,
  onChoose,
}: {
  pattern: BgPattern;
  onChoose: (next: BgPattern) => void;
}) {
  return (
    <SegmentedControl
      className="bg-toggle"
      ariaLabel="Background pattern (preview)"
      value={pattern}
      options={OPTIONS}
      onChange={onChoose}
    />
  );
}
