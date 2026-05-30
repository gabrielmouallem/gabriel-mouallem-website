import type { CSSProperties } from "react";

type BlendMode = NonNullable<CSSProperties["mixBlendMode"]>;

export interface GrainProps {
  /** Dark scrim alpha (0 – 0.6). 0 disables. Default 0.30. */
  scrimAlpha?: number;
  /** Scrim base color as `r, g, b`. Default '5, 5, 10'. */
  scrimColor?: string;
  /** Base grain visibility (0 – 1.0). 0 disables. Default 0.30. */
  grainOpacity?: number;
  /** Base grain frequency. ~0.4 – 0.9 = chunky pixel grain. Default 0.70. */
  grainFreq?: number;
  /** Bright speck visibility (0 – 0.7). 0 disables. Default 0.18. */
  speckOpacity?: number;
  /** Fraction of pixels that become specks. Default 0.05. */
  speckDensity?: number;
  /** Speck frequency. ~0.3 – 0.5 = chunky 2-4 px specks. Default 0.35. */
  speckFreq?: number;
  /** Vertical scratch visibility (0 – 0.5). 0 disables. Default 0.10. */
  scratchOpacity?: number;
  /** Fraction of pixels that become scratch streaks. Default 0.06. */
  scratchDensity?: number;
  /**
   * Photographic scratch overlay — a real scanned-film texture loaded
   * from `/scratches.jpg`. Adds organic dust + crisscrossing scratch
   * marks that procedural SVG noise can't fake. Set to 0 to disable.
   * Default 0.32.
   */
  photoOpacity?: number;
  /** URL of the photo texture. Default `/scratches.jpg`. */
  photoSrc?: string;
}

const defaults = {
  // Lighter scrim — the prism is allowed to read as full chroma now.
  scrimAlpha: 0.3,
  scrimColor: "5, 5, 10",
  /**
   * Base grain — continuous grayscale noise, `soft-light` blend. Soft-
   * light is symmetric around 0.5: bright noise lifts pixels, dark noise
   * darkens them, mid-gray = no change. Average lift is ~zero so the
   * field keeps its tone while gaining visible texture.
   */
  grainOpacity: 0.3,
  grainFreq: 0.7,
  speckOpacity: 0.18,
  speckDensity: 0.05,
  speckFreq: 0.35,
  scratchOpacity: 0.1,
  scratchDensity: 0.06,
  /**
   * Photo overlay — a scanned scratched-surface texture (Unsplash,
   * free license). The source image is a mid-gray metal surface with
   * brighter scratch lines, so without aggressive contrast + low
   * brightness the whole field reads as "gray metal" instead of "black
   * void with scratches". `screen` blend means only positive RGB
   * contributes, so dimming the source kills the mid-gray surface and
   * lets ONLY the brightest scratches lift the dark mesh.
   *
   * Tuned values:
   *   contrast(2.4) — pulls light grays toward white, darks toward 0
   *   brightness(0.45) — multiplies output down so mid-gray ends at 0.22
   *   opacity 0.18  — final visibility ceiling
   */
  photoOpacity: 0.18,
  photoSrc: "/scratches.jpg",
};

/**
 * feColorMatrix that copies the noise R channel into R, G, and B, and
 * forces alpha to 1. Result: a grayscale-noise image with consistent
 * full opacity. This is what makes `soft-light` blend behave predictably
 * — without it, feTurbulence's independent per-channel noise gives
 * random color/alpha combinations that wreck the blend math.
 */
const NOISE_TO_GRAYSCALE =
  "1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1";

/**
 * For threshold layers (specks, scratches) we DO want sparse white-on-
 * transparent. Forces RGB to white and routes noise R into alpha so
 * `feFuncA discrete` can threshold it into a sparse mask.
 */
const NOISE_TO_WHITE_ALPHA =
  "0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1 0 0 0 0";

/**
 * Build a `feFuncA discrete` table of length `slots` representing the
 * given density. Density 0.10 → table with the top 10 % of values
 * mapped to 1, the rest to 0, e.g. '0 0 0 0 0 0 0 0 0 1' for 10 slots.
 */
function densityTable(density: number, slots = 10): string {
  const ones = Math.max(0, Math.min(slots, Math.round(density * slots)));
  const zeros = slots - ones;
  return Array.from({ length: zeros }, () => "0")
    .concat(Array.from({ length: ones }, () => "1"))
    .join(" ");
}

/**
 * Base grain — continuous grayscale noise, no alpha threshold. Designed
 * to be blended with `soft-light` so the field stays at its average tone
 * but gets visible per-pixel variation.
 */
function grainUri(freq: number): string {
  return `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='${NOISE_TO_GRAYSCALE}'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;
}

/**
 * Dust specks — sparse opaque white dots (~10 % density) via alpha
 * threshold. Blended with `screen` so only the bright pixels contribute,
 * giving a "dust" highlight without a uniform field lift.
 */
function speckUri(freq: number, density: number): string {
  const aTable = densityTable(density);
  return `data:image/svg+xml,%3Csvg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='s'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${freq}' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='${NOISE_TO_WHITE_ALPHA}'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='${aTable}'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23s)'/%3E%3C/svg%3E`;
}

/**
 * Vertical scratch streaks — `baseFrequency='1.5 0.005'` is HIGH x freq
 * + LOW y freq, so the noise oscillates rapidly across columns but
 * barely changes down columns → vertical streaks of consistent value.
 */
function scratchUri(density: number): string {
  const aTable = densityTable(density, 14);
  return `data:image/svg+xml,%3Csvg viewBox='0 0 480 960' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='sc'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5 0.005' numOctaves='1' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='${NOISE_TO_WHITE_ALPHA}'/%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='${aTable}'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23sc)'/%3E%3C/svg%3E`;
}

/**
 * Layered film-grain overlay below the foreground content (z-index 0,
 * pointer-events none).
 *
 *   1. Dark scrim — flat dark cast for text contrast
 *   2. Base grain — continuous grayscale noise, `soft-light` blend
 *      (texture without uniform brightness lift)
 *   3. Dust specks — sparse white dots, `screen` blend (bright accents)
 *   4. Vertical scratches — sparse vertical streaks, `screen` blend
 */
export default function Grain(props: GrainProps = {}) {
  const cfg = { ...defaults, ...props };

  const layer = (extra: CSSProperties): CSSProperties => ({
    position: "fixed",
    inset: 0,
    zIndex: 0,
    pointerEvents: "none",
    ...extra,
  });

  return (
    <>
      {cfg.scrimAlpha > 0 && (
        <div
          aria-hidden="true"
          style={layer({
            background: `rgba(${cfg.scrimColor}, ${cfg.scrimAlpha})`,
          })}
        />
      )}

      {cfg.grainOpacity > 0 && (
        <div
          aria-hidden="true"
          style={layer({
            backgroundImage: `url("${grainUri(cfg.grainFreq)}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
            opacity: cfg.grainOpacity,
            mixBlendMode: "soft-light" satisfies BlendMode,
          })}
        />
      )}

      {cfg.speckOpacity > 0 && (
        <div
          aria-hidden="true"
          style={layer({
            backgroundImage: `url("${speckUri(cfg.speckFreq, cfg.speckDensity)}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "320px 320px",
            opacity: cfg.speckOpacity,
            mixBlendMode: "screen",
          })}
        />
      )}

      {cfg.scratchOpacity > 0 && (
        <div
          aria-hidden="true"
          style={layer({
            backgroundImage: `url("${scratchUri(cfg.scratchDensity)}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "480px 960px",
            opacity: cfg.scratchOpacity,
            mixBlendMode: "screen",
          })}
        />
      )}

      {cfg.photoOpacity > 0 && (
        <div
          aria-hidden="true"
          style={layer({
            backgroundImage: `url("${cfg.photoSrc}")`,
            backgroundRepeat: "repeat",
            backgroundSize: "1024px auto",
            opacity: cfg.photoOpacity,
            mixBlendMode: "screen",
            // Desaturate the source so any color cast from the photo
            // doesn't tint the prism; boost contrast so the bright
            // scratches pop and the dark surface stays out of the way.
            filter: "grayscale(1) contrast(2.4) brightness(0.45)",
          })}
        />
      )}
    </>
  );
}
