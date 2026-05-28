/**
 * Tuning knobs for the gradient mesh. These map 1:1 to Paper Design's
 * `<MeshGradient>` props. Defaults below are tuned for a static, organic,
 * dark-text-readable composition.
 */
export interface MeshConfig {
  /** Organic blob deformation (0 – 1.5). */
  distortion: number;
  /** Rotational flow (0 – 1). Low so motion doesn't blend regions. */
  swirl: number;
  /** Brushy/impasto grain at color edges. Preserves spot separation. */
  grainMixer: number;
  /** Film-grain overlay opacity. */
  grainOverlay: number;
  /**
   * Animation speed at rest. Defaults to 0 (static). Crank up only when
   * you want movement (e.g. 0.18 for slow drift).
   */
  speed: number;
  /**
   * Deterministic time offset. With `speed: 0`, picks which static frame
   * is rendered — tune until the composition reads well.
   */
  frame: number;
  /** Optional CSS filter on the canvas wrapper. */
  filter?: string;
  /** Multiplied with `speed` while pointer is over the surface. */
  speedHoverMultiplier: number;
}

export const defaultMeshConfig: MeshConfig = {
  distortion: 0.85,
  swirl: 0.12,
  grainMixer: 0.45,
  grainOverlay: 0.07,
  speed: 0,
  frame: 6.5,
  filter: "saturate(1.02) brightness(1.0)",
  speedHoverMultiplier: 2.0,
};
