import { motion } from 'framer-motion';
import { presentation } from '../data/presentation.js';
import { getTransition } from '../transitions/transitions.js';
import TitleSlide from './layouts/TitleSlide.jsx';
import OutlineSlide from './layouts/OutlineSlide.jsx';
import ContentSlide from './layouts/ContentSlide.jsx';
import ProgressiveBuildSlide from './layouts/ProgressiveBuildSlide.jsx';
import DiscussionSlide from './layouts/DiscussionSlide.jsx';
import DiagramSlide from './layouts/DiagramSlide.jsx';
import MediaSlide from './layouts/MediaSlide.jsx';
import ColabLinkSlide from './layouts/ColabLinkSlide.jsx';

const layoutMap = {
  title: TitleSlide,
  outline: OutlineSlide,
  content: ContentSlide,
  progressiveBuild: ProgressiveBuildSlide,
  discussion: DiscussionSlide,
  diagram: DiagramSlide,
  media: MediaSlide,
  colabLink: ColabLinkSlide,
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
        if (tag === 'a' || tag === 'button' || tag === 'video' || tag === 'input') {
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
