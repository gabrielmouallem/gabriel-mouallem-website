interface Props {
  /** Video URL to use as the fixed background. */
  src?: string;
  /** Static poster image shown before the video can play. */
  poster?: string;
}

/**
 * Looping film-scratch video background. Same composition trick as the
 * old static image — `object-fit: cover` + `object-position: right
 * center` zooms past the left-edge light leak so it stays off-screen
 * on any viewport from ~1024 px up.
 *
 * Plays muted, looping, inline (required for autoplay on mobile Safari
 * / Chrome). Drops a static poster image while the MP4 hydrates so
 * there's no brief flash of empty bg color on first paint.
 */
export default function Background({
  src = "/scratches.mp4",
  poster = "/bg-3-scratches-leak.jpg",
}: Props) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          /* Mirror `background-size: 150% auto; background-position:
             right center` — video is 150 % viewport wide, height auto,
             anchored to viewport right so the source's left-edge light
             leak ends up off-screen. */
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: "150%",
          height: "auto",
          minHeight: "100%",
          objectFit: "cover",
        }}
      />
      {/* Translucent black scrim ON TOP of the video — sits between the
          video and the foreground content. Darkens the scratch motion
          without removing it. Tune alpha to taste. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
    </div>
  );
}
