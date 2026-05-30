import type { RefObject } from "react";
import { experiences } from "../../data/experiences";
import { extractYears } from "./utils";

interface Props {
  activeIdx: number;
  compact: boolean;
  timelineRef: RefObject<HTMLDivElement | null>;
  labelRefs: RefObject<Array<HTMLDivElement | null>>;
  /** Jump to an experience index (or -1 for home). */
  onSelect: (i: number) => void;
}

export function Timeline({
  activeIdx,
  compact,
  timelineRef,
  labelRefs,
  onSelect,
}: Props) {
  const N = experiences.length;
  return (
    <div
      ref={timelineRef}
      className="timeline"
      data-compact={compact ? "true" : "false"}
    >
      <div className="timeline-grid">
        {experiences.map((exp, i) => {
          const isActive = activeIdx === i;
          const isPast = i < activeIdx;
          return (
            <button
              key={i}
              type="button"
              className="timeline-col"
              data-active={isActive ? "true" : "false"}
              data-past={isPast ? "true" : "false"}
              data-first={i === 0 ? "true" : "false"}
              data-last={i === N - 1 ? "true" : "false"}
              style={{ left: `${(i / (N - 1)) * 100}%` }}
              onClick={() => onSelect(i)}
              aria-label={`Jump to ${exp.company}`}
            >
              <div
                className="timeline-label"
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
              >
                <div className="timeline-idx">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="timeline-name">{exp.shortLabel}</div>
                <div className="timeline-years">
                  {extractYears(exp.dates)}
                </div>
              </div>
              <div className="timeline-line" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
