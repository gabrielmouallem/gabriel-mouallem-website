import type { CSSProperties } from "react";

type BlendMode = NonNullable<CSSProperties["mixBlendMode"]>;

export interface GrainProps {
  /** Grain visibility (0 – 0.3). Default 0.16. */
  opacity?: number;
  /** Dark scrim alpha (0 – 0.5). 0 disables the scrim. Default 0.32. */
  scrimAlpha?: number;
  /** Scrim base color as `r, g, b`. Default '8, 10, 16' (deep blue-black). */
  scrimColor?: string;
  /** Noise base frequency. Higher = finer grain. Default 0.88. */
  frequency?: number;
  /** Number of fractal octaves (1–4). Default 3. */
  octaves?: number;
  /** Repeat tile size in px. Default 320. */
  tile?: number;
  /** Noise blend mode. Default 'overlay'. */
  blend?: BlendMode;
}

const defaults = {
  opacity: 0.16,
  scrimAlpha: 0.32,
  scrimColor: "8, 10, 16",
  frequency: 0.88,
  octaves: 3,
  tile: 320,
  blend: "overlay" as BlendMode,
};

/**
 * URL-encoded inline SVG turbulence. `baseFrequency` controls coarseness,
 * `numOctaves` the layering depth, `stitchTiles="stitch"` lets the pattern
 * tile seamlessly when repeated. Kept as a single line so the data URI
 * stays compact.
 */
function noiseDataUri(frequency: number, octaves: number): string {
  return `data:image/svg+xml,%3Csvg viewBox='0 0 320 320' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;
}

/**
 * Two stacked fixed layers below the content:
 *  1. A dark scrim (flat color, alpha-controlled) for text contrast
 *  2. A repeating SVG turbulence noise pattern blended over the scrim
 *
 * Both sit at z-index 0 with `pointer-events: none`. The hero content is
 * expected to sit at z-index ≥ 1, so it never picks up the blend mode and
 * its text stays crisp.
 */
export default function Grain(props: GrainProps = {}) {
  const cfg = { ...defaults, ...props };
  const noiseUrl = noiseDataUri(cfg.frequency, cfg.octaves);

  return (
    <>
      {cfg.scrimAlpha > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: `rgba(${cfg.scrimColor}, ${cfg.scrimAlpha})`,
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `url("${noiseUrl}")`,
          backgroundRepeat: "repeat",
          backgroundSize: `${cfg.tile}px ${cfg.tile}px`,
          opacity: cfg.opacity,
          mixBlendMode: cfg.blend,
        }}
      />
    </>
  );
}
