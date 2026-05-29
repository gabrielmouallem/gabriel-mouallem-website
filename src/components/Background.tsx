import { useEffect } from "react";
import GradientMesh from "./gradient/GradientMesh";
import PrismRibbon, {
  type PrismRibbonConfig,
} from "./gradient/PrismRibbon";
import Grain, { type GrainProps } from "./gradient/Grain";
import { palettes, type PaletteKey } from "./gradient/palettes";
import type { MeshConfig } from "./gradient/types";

type Variant = "ribbon" | "mesh";

interface Props {
  /** Which shader treatment to render. */
  variant?: Variant;
  /**
   * Palette key. Light and dark palettes both work; on dark palettes
   * the first stop is used as the void background and the remaining
   * stops feed the prism ramp.
   */
  palette?: PaletteKey;
  /** Shader tuning. Shape depends on `variant`. */
  config?: Partial<MeshConfig> | Partial<PrismRibbonConfig>;
  /**
   * Grain + dark-scrim overlay on top of the shader. `false` disables;
   * an object overrides the defaults. Enabled by default.
   */
  grain?: false | Partial<GrainProps>;
}

export default function Background({
  variant = "ribbon",
  palette = "prismaticSpectrum",
  config,
  grain,
}: Props) {
  const p = palettes[palette];

  useEffect(() => {
    document.documentElement.dataset.paletteMode = p.mode;
    return () => {
      delete document.documentElement.dataset.paletteMode;
    };
  }, [p.mode]);

  const shader =
    variant === "ribbon" ? (
      <PrismRibbon palette={p} config={config as Partial<PrismRibbonConfig>} />
    ) : (
      <GradientMesh palette={p} config={config as Partial<MeshConfig>} />
    );

  return (
    <>
      {shader}
      {grain !== false && <Grain {...(grain ?? {})} />}
    </>
  );
}
