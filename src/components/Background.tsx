import { useEffect } from "react";
import GradientMesh from "./gradient/GradientMesh";
import { palettes, type PaletteKey } from "./gradient/palettes";
import type { MeshConfig } from "./gradient/types";

interface Props {
  /**
   * Palette key. One swap → entire site theme flips.
   *
   * Light: 'botanica' | 'lichen' | 'forestMagic' | 'sunwash' | 'glacial'
   *      | 'riso' | 'sumie' | 'pollen' | 'cyanotype' | 'saint'
   * Dark:  'prismaticDispersion' | 'prismaticAurora' | 'prismaticNewton'
   *      | 'prismaticCrystal' | 'prismaticOnyx' | 'prismaticSpectrum'
   *      | 'bismuthCrystal' | 'holographicCD' | 'auroraBorealis'
   *      | 'nebula' | 'plasma' | 'vaporwave' | 'ironEmberDark' | 'cherenkov'
   */
  palette?: PaletteKey;
  config?: Partial<MeshConfig>;
}

export default function Background({
  palette = "prismaticDispersion",
  config,
}: Props) {
  const p = palettes[palette];

  useEffect(() => {
    document.documentElement.dataset.paletteMode = p.mode;
    return () => {
      delete document.documentElement.dataset.paletteMode;
    };
  }, [p.mode]);

  return <GradientMesh palette={p} config={config} />;
}
