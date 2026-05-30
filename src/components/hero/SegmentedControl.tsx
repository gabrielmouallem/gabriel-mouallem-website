import type { ReactNode } from "react";

export interface SegmentOption<T extends string> {
  value: T;
  /** Text label (text segments). Omit when using an icon. */
  label?: string;
  /** Icon node (icon segments). Omit when using a text label. */
  icon?: ReactNode;
  /** Accessible name — required for icon-only segments. */
  ariaLabel?: string;
}

/**
 * Shared mono segmented control — a `role="group"` of squared, dashed buttons
 * with a monochrome filled active state. Backs both the color-theme picker and
 * the background-pattern picker so they read as the same component (see the
 * `.seg` block in global.css). Pass `className` for per-instance positioning.
 */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: T;
  options: ReadonlyArray<SegmentOption<T>>;
  onChange: (next: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      className={`seg${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        const name = opt.ariaLabel ?? opt.label;
        return (
          <button
            key={opt.value}
            type="button"
            className="seg-btn"
            data-active={active}
            aria-pressed={active}
            aria-label={name}
            title={name}
            onClick={() => onChange(opt.value)}
          >
            {opt.icon ? (
              <span className="seg-icon" aria-hidden="true">
                {opt.icon}
              </span>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
}
