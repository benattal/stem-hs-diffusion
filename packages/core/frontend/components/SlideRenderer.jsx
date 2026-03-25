import { motion } from 'framer-motion';
import { getTransition } from '../transitions/transitions.js';

export function createSlideRenderer(layoutMap, getPresentation) {
  return function SlideRenderer({ slide, buildStep, direction, sections }) {
    const LayoutComponent = layoutMap[slide.layout];

    if (!LayoutComponent) {
      return <div className="slide">Unknown layout: {slide.layout}</div>;
    }

    const transitionName = slide.transition || getPresentation().defaultTransition;
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
        <div className="slide-content">
          {slide.sectionLabel && (
            <div className="section-label">{slide.sectionLabel}</div>
          )}
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
  };
}
