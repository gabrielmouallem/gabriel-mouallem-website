import type { PalettePreference } from "./usePaletteMode";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";
import { SegmentedControl, type SegmentOption } from "./SegmentedControl";

// Light → dark keeps the sun/moon icons adjacent as a natural progression;
// `system` is the meta/auto option, parked at the end (next-themes / macOS
// "Auto" convention) rather than splitting the spectrum.
const OPTIONS: ReadonlyArray<SegmentOption<PalettePreference>> = [
  { value: "light", icon: <SunIcon />, ariaLabel: "Light theme" },
  { value: "dark", icon: <MoonIcon />, ariaLabel: "Dark theme" },
  { value: "system", icon: <MonitorIcon />, ariaLabel: "Match system theme" },
];

/**
 * Color-theme picker — a mono segmented control (light / system / dark) that
 * sits in the top-right where the decorative plus-cluster used to be. Shares
 * the `SegmentedControl` base with the background-pattern picker below it.
 */
export function PaletteToggle({
  preference,
  onChoose,
}: {
  preference: PalettePreference;
  onChoose: (next: PalettePreference) => void;
}) {
  return (
    <SegmentedControl
      className="palette-toggle"
      ariaLabel="Color theme"
      value={preference}
      options={OPTIONS}
      onChange={onChoose}
    />
  );
}
