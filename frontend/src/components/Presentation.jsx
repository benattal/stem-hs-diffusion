import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSlideState from '../hooks/useSlideState.js';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation.js';
import useSwipeNavigation from '../hooks/useSwipeNavigation.js';
import SlideRenderer from './SlideRenderer.jsx';
import Navigation from './Navigation.jsx';
import ProgressBar from './ProgressBar.jsx';
import SlideOverview from './SlideOverview.jsx';

export default function Presentation() {
  const state = useSlideState();
  const [showOverview, setShowOverview] = useState(false);

  const toggleOverview = useCallback((force) => {
    setShowOverview(prev => force !== undefined ? force : !prev);
  }, []);

  useKeyboardNavigation({
    goNext: state.goNext,
    goPrev: state.goPrev,
    toggleOverview,
  });

  useSwipeNavigation({
    goNext: state.goNext,
    goPrev: state.goPrev,
  });

  const handleOverviewSelect = useCallback((index) => {
    state.goToSlide(index);
    setShowOverview(false);
  }, [state.goToSlide]);

  return (
    <div className="presentation" onClick={state.goNext}>
      <ProgressBar current={state.currentIndex} total={state.totalSlides} />

      <AnimatePresence mode="wait">
        <SlideRenderer
          key={state.currentIndex}
          slide={state.currentSlide}
          buildStep={state.buildStep}
          direction={state.direction}
          sections={state.sections}
        />
      </AnimatePresence>

      <Navigation
        currentIndex={state.currentIndex}
        totalSlides={state.totalSlides}
        flatSlides={state.flatSlides}
        sectionTitle={state.currentSlide?.sectionTitle}
        goNext={state.goNext}
        goPrev={state.goPrev}
        goToSlide={state.goToSlide}
        isFirst={state.isFirst}
        isLast={state.isLast}
      />

      <div className="keyboard-hint">
        Press <kbd>O</kbd> for overview
      </div>

      {showOverview && (
        <SlideOverview
          flatSlides={state.flatSlides}
          currentIndex={state.currentIndex}
          onSelect={handleOverviewSelect}
          onClose={() => setShowOverview(false)}
        />
      )}
    </div>
  );
}
