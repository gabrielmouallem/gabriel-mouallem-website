import { About } from "./hero/About";
import {
  ExperienceAnnotations,
  ExperiencePanels,
} from "./hero/Experiences";
import { HeroTitle } from "./hero/HeroTitle";
import { Nav } from "./hero/Nav";
import { PaletteToggle } from "./hero/PaletteToggle";
import { BgToggle } from "./hero/BgToggle";
import { Timeline } from "./hero/Timeline";
import { useAboutModal } from "./hero/useAboutModal";
import { useBgPattern } from "./hero/useBgPattern";
import { useExperienceTimeline } from "./hero/useExperienceTimeline";
import { useHashDeepLink } from "./hero/useHashDeepLink";
import { usePaletteMode } from "./hero/usePaletteMode";
import { useScrollLock } from "./hero/useScrollLock";

/**
 * Hero island — composes the scroll-driven experience timeline, palette
 * toggle, about modal, and hash deep-linking. All behaviour lives in the
 * dedicated hooks; this component only wires state into the view.
 */
export default function Hero() {
  const {
    wrapperRef,
    stageRef,
    timelineRef,
    labelRefs,
    inTimeline,
    activeIdx,
    compact,
    scrollTo,
  } = useExperienceTimeline();

  const { preference, choosePreference } = usePaletteMode();
  const { pattern, choose } = useBgPattern();
  const { aboutOpen, openAbout, closeAbout } = useAboutModal();

  // Lock page scroll (pin-safe — see the hook) whenever the modal is open.
  useScrollLock(aboutOpen);

  useHashDeepLink({ activeIdx, aboutOpen, onOpenAbout: openAbout, scrollTo });

  return (
    <div ref={wrapperRef} className="hero-wrapper">
      <div ref={stageRef} className="hero-stage">
        <Nav onAbout={openAbout} />
        {aboutOpen && <About onClose={closeAbout} />}
        <PaletteToggle preference={preference} onChoose={choosePreference} />
        <BgToggle pattern={pattern} onChoose={choose} />

        <HeroTitle inTimeline={inTimeline} />

        <ExperienceAnnotations activeIdx={activeIdx} />
        <ExperiencePanels activeIdx={activeIdx} />

        <Timeline
          activeIdx={activeIdx}
          compact={compact}
          timelineRef={timelineRef}
          labelRefs={labelRefs}
          onSelect={scrollTo}
        />

        <div
          className="scroll-hint"
          data-hidden={aboutOpen ? "true" : "false"}
          data-in-timeline={inTimeline ? "true" : "false"}
        >
          scroll or click to walk through 7 years
        </div>
      </div>
    </div>
  );
}
