/**
 * Compress a "Jul 2019 — Nov 2021" style range into "2019—2021"
 * (and a trailing "Present" into "now") for the compact timeline label.
 * Falls back to the original string when no year pair is found.
 */
export function extractYears(dates: string): string {
  const m = dates.match(/(\d{4}).*?(\d{4}|Present)/);
  if (!m) return dates;
  return `${m[1]}—${m[2] === "Present" ? "now" : m[2]}`;
}
