/**
 * Curated palette catalogue for the gradient mesh background.
 *
 * Each palette is a 6-stop tuple consumed by Paper Design's `<MeshGradient>`.
 * Order is preserved — the shader interprets stops as 6 color spots that
 * orbit the frame, so re-ordering changes spatial composition.
 *
 * The `mode` field drives foreground text color via a `data-palette-mode`
 * attribute on the <html> root, swapping a CSS variable.
 *
 * Swap the active palette in one place: `src/pages/index.astro`.
 */

export interface Palette {
  slug: string;
  name: string;
  sub: string;
  /** Drives text color. 'light' = dark text, 'dark' = off-white text. */
  mode: "light" | "dark";
  colors: readonly [string, string, string, string, string, string];
}

export const palettes = {
  // ---------------------------------------------------------------- light
  botanica: {
    slug: "botanica",
    name: "Botanica",
    sub: "Warm earth, sage, deep moss",
    mode: "light",
    colors: ["#fff3d4", "#e8c98f", "#bca56b", "#7fa370", "#3f6e58", "#23423a"],
  },
  lichen: {
    slug: "lichen",
    name: "Lichen",
    sub: "Crustose colonies on weathered stone",
    mode: "light",
    colors: ["#2A2520", "#5C4F38", "#A88A4D", "#C4B589", "#D9D2C0", "#C46B7F"],
  },
  forestMagic: {
    slug: "forest-magic",
    name: "Forest Magic",
    sub: "Three greens + one forbidden rose",
    mode: "light",
    colors: ["#1E3D2F", "#3E7A5C", "#7BC489", "#D4E68C", "#F2D472", "#B85C7A"],
  },
  sunwash: {
    slug: "sunwash",
    name: "Sunwash",
    sub: "Cream to indigo, warm prismatic",
    mode: "light",
    colors: ["#fff6e1", "#ffd294", "#ff9c66", "#e36a8f", "#a06ce0", "#3d4a8a"],
  },
  glacial: {
    slug: "glacial",
    name: "Glacial",
    sub: "Ice through ocean to navy",
    mode: "light",
    colors: ["#f3f7ff", "#cfe0ff", "#7ab8e6", "#3da896", "#246a78", "#162a4a"],
  },
  riso: {
    slug: "riso",
    name: "Riso",
    sub: "Print-zine duotone energy",
    mode: "light",
    colors: ["#fff6dc", "#ffe26b", "#ff8b9a", "#a78bfa", "#3a6cff", "#1a2470"],
  },
  sumie: {
    slug: "sumi-e",
    name: "Sumi-e",
    sub: "Pine-soot ink, vermillion seal",
    mode: "light",
    colors: ["#161412", "#3A3530", "#6B6358", "#A8A096", "#E8E2D6", "#C73C2E"],
  },
  pollen: {
    slug: "pollen",
    name: "Pollen",
    sub: "Saffron crocus through chamomile bloom",
    mode: "light",
    colors: ["#3F2A06", "#8B5E0F", "#D69819", "#F5C955", "#FAE5A0", "#5B4FC6"],
  },
  cyanotype: {
    slug: "cyanotype",
    name: "Cyanotype",
    sub: "Herschel's iron-cyanide print, 1842",
    mode: "light",
    colors: ["#0D2F5F", "#1E5B96", "#4A8DBF", "#8FB6D6", "#D6E4F0", "#E8B976"],
  },
  saint: {
    slug: "saint",
    name: "Saint (reference)",
    sub: "Original ST.MARTIN palette",
    mode: "light",
    colors: ["#df3000", "#ff9125", "#dad99a", "#72e0e8", "#14a3d6", "#3a0005"],
  },

  // ----------------------------------------------------------------- dark
  prismaticDispersion: {
    slug: "prismatic-dispersion",
    name: "Prismatic Dispersion",
    sub: "White light bent through a prism, against onyx",
    mode: "dark",
    colors: ["#020308", "#0A0A18", "#FF2D8C", "#FFB02E", "#00E89C", "#4D40E5"],
  },
  prismaticAurora: {
    slug: "prismatic-aurora",
    name: "Prismatic Aurora",
    sub: "Aurora cap colors at full chroma",
    mode: "dark",
    colors: ["#020308", "#0A1428", "#00FF8B", "#1AE5E5", "#7B5DFF", "#FF3FAF"],
  },
  prismaticNewton: {
    slug: "prismatic-newton",
    name: "Prismatic Newton",
    sub: "Newton's 1666 prism, four anchors",
    mode: "dark",
    colors: ["#020308", "#0A0A18", "#FF1F3D", "#FFD11A", "#1AE89C", "#5D2DFF"],
  },
  prismaticCrystal: {
    slug: "prismatic-crystal",
    name: "Prismatic Crystal",
    sub: "Refraction caustic of a single quartz facet",
    mode: "dark",
    colors: ["#020308", "#0A1218", "#3FFFB0", "#00E5FF", "#5040FF", "#FF3FB0"],
  },
  prismaticOnyx: {
    slug: "prismatic-onyx",
    name: "Prismatic Onyx",
    sub: "Three voids, three intrusions",
    mode: "dark",
    colors: ["#000003", "#06060E", "#0E0A1A", "#1AFFCB", "#7B1FFF", "#FF1F5D"],
  },
  prismaticSpectrum: {
    slug: "prismatic-spectrum",
    name: "Prismatic Spectrum",
    sub: "ROYGBIV at full chroma against single void",
    mode: "dark",
    colors: ["#020308", "#FF1F2D", "#FFAA1A", "#FFEE22", "#1AE89C", "#5D2DFF"],
  },
  bismuthCrystal: {
    slug: "bismuth-crystal",
    name: "Bismuth Crystal",
    sub: "Thin-film on hopper lattice",
    mode: "dark",
    colors: ["#1A0820", "#4DB89C", "#FFC9F0", "#FFE077", "#7B58D6", "#0F1F4A"],
  },
  holographicCD: {
    slug: "holographic-cd",
    name: "Holographic CD",
    sub: "Diffraction grating, 1.6μm pitch",
    mode: "dark",
    colors: ["#000018", "#FF4DDB", "#FFEC4D", "#4DFFCB", "#4DBBFF", "#BB4DFF"],
  },
  auroraBorealis: {
    slug: "aurora-borealis",
    name: "Aurora Borealis",
    sub: "Oxygen-green & nitrogen-violet",
    mode: "dark",
    colors: ["#0A0F1E", "#1A5C2E", "#3FE89A", "#7BDFFF", "#5530D6", "#0F0820"],
  },
  nebula: {
    slug: "nebula",
    name: "Nebula",
    sub: "Hubble Pillars, narrowband",
    mode: "dark",
    colors: ["#000010", "#3D2F5C", "#9B2D6E", "#FFA85C", "#3FBADB", "#1A0530"],
  },
  plasma: {
    slug: "plasma",
    name: "Plasma",
    sub: "V1 form-constant resonance",
    mode: "dark",
    colors: ["#0A001F", "#4A0A8F", "#D63FFF", "#FF3FAF", "#3FA0FF", "#1F0050"],
  },
  vaporwave: {
    slug: "vaporwave",
    name: "Vaporwave",
    sub: "Y2K internet, magenta + cyan + violet",
    mode: "dark",
    colors: ["#0F0033", "#FF3DC4", "#3FE0FF", "#7B3DFF", "#FF8FCB", "#1A0066"],
  },
  ironEmberDark: {
    slug: "iron-ember-dark",
    name: "Iron Ember (dark)",
    sub: "Blackbody radiation on void",
    mode: "dark",
    colors: ["#0A0202", "#3D0A04", "#8B1A0A", "#F57426", "#FCB04A", "#FDE48C"],
  },
  cherenkov: {
    slug: "cherenkov",
    name: "Cherenkov",
    sub: "Charged particles past lightspeed in water",
    mode: "dark",
    colors: ["#000412", "#020A1F", "#0A2A6B", "#3F8FFF", "#9FD4FF", "#FFE49C"],
  },
} as const satisfies Record<string, Palette>;

export type PaletteKey = keyof typeof palettes;
