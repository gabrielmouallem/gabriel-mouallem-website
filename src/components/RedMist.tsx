import { MeshGradient } from "@paper-design/shaders-react";

interface Props {
  /** 0 – 1. Overall visibility of the red mesh. Default 0.35. */
  opacity?: number;
  /** Blend mode against the layers below. `screen` lifts darks toward
   * red where the mesh is bright; `lighten` only contributes where the
   * mesh is brighter than the backdrop. Default `screen`. */
  blend?: "screen" | "lighten" | "plus-lighter" | "color-dodge";
  /** Animation speed; 0 = static. Default 0.10. */
  speed?: number;
}

/**
 * Sparse red mesh overlay — Paper Design's `<MeshGradient>` blob shader
 * with a deliberately black-heavy palette so most of the field stays
 * transparent under `screen` blend, and only a few red blobs lift the
 * dark video bg toward crimson. Doesn't tile, doesn't repeat — six
 * color spots orbit organically across the viewport.
 *
 * Layered as a separate fixed div at the same z-index as the video bg,
 * but later in DOM order so it composites on top of the video + scrim.
 * Hero content (z-index 1) sits above this.
 */
export default function RedMist({
  opacity = 0.35,
  blend = "screen",
  speed = 0.1,
}: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: blend,
      }}
    >
      <MeshGradient
        /**
         * Mostly black + dark-maroon stops with two red highlights.
         * Under screen blend, only the red stops lift the dark
         * backdrop — the black/maroon stops contribute ~nothing,
         * leaving patches of red over an otherwise clean field.
         */
        colors={[
          "#000000",
          "#1a0306",
          "#FF1A2A",
          "#0a0103",
          "#C81022",
          "#000000",
        ]}
        distortion={0.85}
        swirl={0.12}
        grainMixer={0.35}
        grainOverlay={0.04}
        speed={speed}
        frame={6.5}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
