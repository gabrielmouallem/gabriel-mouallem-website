import { MeshGradient } from "@paper-design/shaders-react";
import { useEffect, useState } from "react";
import type { Palette } from "./palettes";
import { defaultMeshConfig, type MeshConfig } from "./types";

interface Props {
  palette: Palette;
  config?: Partial<MeshConfig>;
}

export default function GradientMesh({ palette, config }: Props) {
  const cfg = { ...defaultMeshConfig, ...config };
  const [reduced, setReduced] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animated = cfg.speed > 0 && !reduced;
  const speed = animated
    ? hover
      ? cfg.speed * cfg.speedHoverMultiplier
      : cfg.speed
    : 0;

  const fallbackGradient = `linear-gradient(135deg, ${palette.colors.join(", ")})`;

  return (
    <div
      aria-hidden="true"
      onPointerEnter={() => animated && setHover(true)}
      onPointerLeave={() => animated && setHover(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: animated ? "auto" : "none",
        background: fallbackGradient,
        filter: cfg.filter,
        contain: "strict",
      }}
    >
      <MeshGradient
        colors={[...palette.colors]}
        distortion={cfg.distortion}
        swirl={cfg.swirl}
        grainMixer={cfg.grainMixer}
        grainOverlay={cfg.grainOverlay}
        speed={speed}
        frame={cfg.frame}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
