import { motion } from 'framer-motion';
import { presentation } from '../data/presentation.js';
import { getTransition } from '../transitions/transitions.js';
import TitleSlide from './layouts/TitleSlide/TitleSlide.jsx';
import OutlineSlide from './layouts/OutlineSlide/OutlineSlide.jsx';
import ContentSlide from './layouts/ContentSlide/ContentSlide.jsx';
import ProgressiveBuildSlide from './layouts/ProgressiveBuildSlide/ProgressiveBuildSlide.jsx';
import DiscussionSlide from './layouts/DiscussionSlide/DiscussionSlide.jsx';
import DiagramSlide from './layouts/DiagramSlide/DiagramSlide.jsx';
import MediaSlide from './layouts/MediaSlide/MediaSlide.jsx';
import ColabLinkSlide from './layouts/ColabLinkSlide/ColabLinkSlide.jsx';
import DiffusionSliderSlide from './layouts/DiffusionSliderSlide/DiffusionSliderSlide.jsx';
import PollSlide from './layouts/PollSlide/PollSlide.jsx';
import PollResultsSlide from './layouts/PollResultsSlide/PollResultsSlide.jsx';
import EmbeddingSpaceSlide from './layouts/EmbeddingSpaceSlide/EmbeddingSpaceSlide.jsx';

const layoutMap = {
  title: TitleSlide,
  outline: OutlineSlide,
  content: ContentSlide,
  progressiveBuild: ProgressiveBuildSlide,
  discussion: DiscussionSlide,
  diagram: DiagramSlide,
  media: MediaSlide,
  colabLink: ColabLinkSlide,
  diffusionSlider: DiffusionSliderSlide,
  poll: PollSlide,
  pollResults: PollResultsSlide,
  embeddingSpace: EmbeddingSpaceSlide,
};

export default function SlideRenderer({ slide, buildStep, direction, sections }) {
  const LayoutComponent = layoutMap[slide.layout];

  if (!LayoutComponent) {
    return <div className="slide">Unknown layout: {slide.layout}</div>;
  }

  const transitionName = slide.transition || presentation.defaultTransition;
  const variant = getTransition(transitionName, direction);

  return (
    <motion.div
      className="slide"
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={variant.transition}
      onClick={(e) => {
        // Don't advance if clicking interactive elements
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'a' || tag === 'button' || tag === 'video' || tag === 'input' || tag === 'canvas') {
          e.stopPropagation();
        }
      }}
    >
      {slide.sectionLabel && (
        <div className="section-label">{slide.sectionLabel}</div>
      )}
      <div className="slide-content">
        <LayoutComponent
          slide={slide}
          buildStep={buildStep}
          sections={sections}
        />
      </div>
      {slide.footnote && (
        <div className="slide-footnote">{slide.footnote}</div>
      )}
    </motion.div>
  );
}
