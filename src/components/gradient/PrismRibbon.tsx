import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Palette } from "./palettes";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Chromatic-dispersion ribbon shader.
 *
 * Technique adapted from the Nova Genomics study: one underlying sinusoid
 * defines the ribbon shape; each prism color samples the SAME shape with
 * a small vertical offset (the dispersion). Where the offsets overlap the
 * colors add to white-ish bloom; where they don't the spectrum stacks
 * transverse to the ribbon — actual prism behavior.
 *
 * The coordinate frame is rotated so the ribbons flow diagonally. The
 * `u_yFreq` knob controls how many ribbons are visible; tighter
 * `u_bandLo`/`u_bandHi` gives sharper bands; `u_dispersion` controls the
 * width of the prism strip across each band.
 *
 * Static — no time uniform, no animation loop.
 */
const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 u_resolution;
  uniform vec3 u_bg;
  uniform vec3 u_c0;
  uniform vec3 u_c1;
  uniform vec3 u_c2;
  uniform vec3 u_c3;
  uniform vec3 u_c4;
  uniform vec3 u_c5;
  uniform float u_rotation;
  uniform float u_dispersion;
  uniform float u_waveAmp;
  uniform float u_waveFreq;
  uniform float u_waveAmp2;
  uniform float u_waveFreq2;
  uniform float u_yFreq;
  uniform float u_bandLo;
  uniform float u_bandHi;
  uniform float u_intensity;
  uniform float u_grain;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 stopAt(int i) {
    if (i == 0) return u_c0;
    if (i == 1) return u_c1;
    if (i == 2) return u_c2;
    if (i == 3) return u_c3;
    if (i == 4) return u_c4;
    return u_c5;
  }

  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 p = (vUv - 0.5) * 2.0;
    p.x *= aspect;

    /* Rotate the whole field so the ribbons flow diagonally. */
    float cs = cos(u_rotation);
    float sn = sin(u_rotation);
    p = mat2(cs, -sn, sn, cs) * p;

    vec3 col = u_bg;

    /* Loop over 6 palette stops; each samples the same ribbon shape with
       a small vertical offset (chromatic dispersion). The accumulation is
       additive — overlapping samples brighten toward white naturally. */
    const int N_STOPS = 6;
    for (int i = 0; i < N_STOPS; i++) {
      float t = float(i) / float(N_STOPS - 1);
      float chrom = (t - 0.5) * u_dispersion;

      /* Two layered sinusoids give the ribbon an organic, non-perfectly-
         sinusoidal flow. Same for every chromatic sample. */
      float y =
          p.y
        + chrom
        + sin(p.x * u_waveFreq) * u_waveAmp
        + sin(p.x * u_waveFreq2 + 1.7) * u_waveAmp2;

      float wave = smoothstep(u_bandLo, u_bandHi, sin(y * u_yFreq) * 0.5 + 0.5);

      col += stopAt(i) * wave * u_intensity;
    }

    /* Corner vignette so the bands feel cradled by the void. */
    vec2 vp = vUv - 0.5;
    float vig = smoothstep(0.95, 0.30, length(vp) * 2.0);
    col *= mix(0.72, 1.0, vig);

    /* Fine film grain. */
    float g = hash(vUv * u_resolution);
    col += (g - 0.5) * u_grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface PrismRibbonConfig {
  /** Diagonal flow angle in radians (0 = horizontal, ~0.42 = nice slant). */
  rotation: number;
  /** Vertical spread of the prism across each band (0.06 – 0.20). */
  dispersion: number;
  /** Primary wave amplitude — gives the ribbon its curve. */
  waveAmp: number;
  /** Primary wave frequency. */
  waveFreq: number;
  /** Secondary wave amplitude (organic wobble). */
  waveAmp2: number;
  /** Secondary wave frequency. */
  waveFreq2: number;
  /** How many ribbons fit per unit y (lower = fewer, larger bands). */
  yFreq: number;
  /** Lower edge of the smoothstep band sharpening (0 – 1). */
  bandLo: number;
  /** Upper edge of the smoothstep band sharpening (0 – 1). */
  bandHi: number;
  /** Multiplier on the additive color accumulation. */
  intensity: number;
  /** Film grain amount (0 – 0.15). */
  grain: number;
  /** Optional override for the void background hex. */
  background?: string;
  /** CSS blur in px applied to the canvas wrapper for a softer, more
   * diffused field (0 – 80). Default 22. */
  blur: number;
}

const defaultConfig: PrismRibbonConfig = {
  rotation: 0.42,
  dispersion: 0.075,
  waveAmp: 0.07,
  waveFreq: 2.3,
  waveAmp2: 0.025,
  waveFreq2: 4.7,
  yFreq: 7.0,
  bandLo: 0.93,
  bandHi: 0.998,
  // Lower so the dark scrim from <Grain /> doesn't fight the prism colors.
  // The blur smears bright cores into soft glow, so we don't need as much.
  intensity: 0.28,
  grain: 0.04,
  // Spreads the ribbons into soft glow strips — helps readability of
  // overlay text without losing the chromatic dispersion structure.
  blur: 22,
};

function hexToRGB(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  return [
    parseInt(m.slice(0, 2), 16) / 255,
    parseInt(m.slice(2, 4), 16) / 255,
    parseInt(m.slice(4, 6), 16) / 255,
  ];
}

/**
 * Build the 6-stop prism. For dark palettes the two dark anchors are
 * dropped and only the vibrant colors feed the spectrum; for light
 * palettes the full 6 are used in order.
 *
 * The order matters: chromatic dispersion stacks colors transverse to
 * the band in the order given, so for the cleanest "rainbow strip" look
 * the palette should already be spectrally ordered.
 */
function buildRamp(palette: Palette): readonly string[] {
  if (palette.mode === "dark") {
    // Drop ONLY the true void anchor (colors[0]); keep colors[1] because
    // for spectrum-style palettes (prismaticSpectrum, prismaticNewton)
    // it's the red/start-of-rainbow, not a dark anchor. Endpoints are
    // weighted so the monotonic prism stack reads cleanly across the band.
    const [, c1, c2, c3, c4, c5] = palette.colors;
    return [c1, c1, c2, c3, c4, c5];
  }
  return palette.colors;
}

interface Props {
  palette: Palette;
  config?: Partial<PrismRibbonConfig>;
}

export default function PrismRibbon({ palette, config }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cfg = { ...defaultConfig, ...config };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(dpr);
    const dom = renderer.domElement;
    dom.style.cssText = "display:block;width:100%;height:100%;";

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const toVec3 = (hex: string) => new THREE.Vector3(...hexToRGB(hex));

    const isDark = palette.mode === "dark";
    const bgHex = cfg.background ?? (isDark ? palette.colors[0] : "#070716");
    const stops = buildRamp(palette);

    const uniforms = {
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_bg: { value: toVec3(bgHex) },
      u_c0: { value: toVec3(stops[0]) },
      u_c1: { value: toVec3(stops[1]) },
      u_c2: { value: toVec3(stops[2]) },
      u_c3: { value: toVec3(stops[3]) },
      u_c4: { value: toVec3(stops[4]) },
      u_c5: { value: toVec3(stops[5]) },
      u_rotation: { value: cfg.rotation },
      u_dispersion: { value: cfg.dispersion },
      u_waveAmp: { value: cfg.waveAmp },
      u_waveFreq: { value: cfg.waveFreq },
      u_waveAmp2: { value: cfg.waveAmp2 },
      u_waveFreq2: { value: cfg.waveFreq2 },
      u_yFreq: { value: cfg.yFreq },
      u_bandLo: { value: cfg.bandLo },
      u_bandHi: { value: cfg.bandHi },
      u_intensity: { value: cfg.intensity },
      u_grain: { value: cfg.grain },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    container.appendChild(dom);

    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.u_resolution.value.set(w * dpr, h * dpr);
      renderer.render(scene, camera);
    };
    updateSize();

    const onResize = () => updateSize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, [palette, config]);

  const cfg = { ...defaultConfig, ...config };

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        // Extend slightly past the viewport so blur edges don't fade
        // into a dark border at the screen edges.
        inset: `-${Math.ceil(cfg.blur * 1.6)}px`,
        zIndex: 0,
        pointerEvents: "none",
        background:
          palette.mode === "dark"
            ? palette.colors[0]
            : `linear-gradient(135deg, ${palette.colors.join(", ")})`,
        contain: "strict",
        filter: cfg.blur > 0 ? `blur(${cfg.blur}px)` : undefined,
      }}
    />
  );
}
