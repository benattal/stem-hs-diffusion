import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSlideState from '../hooks/useSlideState.js';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation.js';
import useSwipeNavigation from '../hooks/useSwipeNavigation.js';
import useFullscreen from '../hooks/useFullscreen.js';
import { useSyncBroadcaster } from '../hooks/usePresentationSync.js';
import SlideRenderer from './SlideRenderer.jsx';
import Navigation from './Navigation.jsx';
import ProgressBar from './ProgressBar.jsx';
import SlideOverview from './SlideOverview.jsx';

export default function Presentation() {
  const state = useSlideState();
  const [showOverview, setShowOverview] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { openPresenterWindow } = useSyncBroadcaster({
    currentIndex: state.currentIndex,
    buildStep: state.buildStep,
    totalSlides: state.totalSlides,
  });

  // Listen for navigation commands from the presenter window
  useEffect(() => {
    const channel = new BroadcastChannel('vision-workshop-presenter');
    channel.onmessage = (event) => {
      if (event.data.type === 'command') {
        if (event.data.command === 'next') state.goNext();
        if (event.data.command === 'prev') state.goPrev();
      }
    };
    return () => channel.close();
  }, [state.goNext, state.goPrev]);

  const toggleOverview = useCallback((force) => {
    setShowOverview(prev => force !== undefined ? force : !prev);
  }, []);

  useKeyboardNavigation({
    goNext: state.goNext,
    goPrev: state.goPrev,
    toggleOverview,
    toggleFullscreen,
    openPresenterWindow,
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
        <kbd>O</kbd> overview &nbsp;
        <kbd>F</kbd> fullscreen &nbsp;
        <kbd>P</kbd> presenter notes
      </div>

      <div className="toolbar-buttons">
        <button
          className="toolbar-btn"
          onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
          title="Toggle fullscreen (F)"
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
        <button
          className="toolbar-btn"
          onClick={(e) => { e.stopPropagation(); openPresenterWindow(); }}
          title="Open presenter notes (P)"
        >
          📋
        </button>
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
