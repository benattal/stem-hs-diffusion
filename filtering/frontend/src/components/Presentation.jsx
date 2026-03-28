import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useSlideState from '@core/hooks/useSlideState.js';
import useKeyboardNavigation from '@core/hooks/useKeyboardNavigation.js';
import useSwipeNavigation from '@core/hooks/useSwipeNavigation.js';
import useFullscreen from '@core/hooks/useFullscreen.js';
import useSlideScaling from '@core/hooks/useSlideScaling.js';
import { useSyncBroadcaster } from '@core/hooks/usePresentationSync.js';
import { usePresenterMode } from '@core/hooks/usePresenterMode.jsx';
import usePresenterControlled from '@core/hooks/usePresenterControlled.js';
import SlideRenderer from './SlideRenderer.jsx';
import Navigation from '@core/components/Navigation.jsx';
import ProgressBar from '@core/components/ProgressBar.jsx';
import SlideOverview from '@core/components/SlideOverview.jsx';

export default function Presentation() {
  const state = useSlideState();
  const [showOverview, setShowOverview] = useState(false);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { scale, designWidth, designHeight } = useSlideScaling();
  const handlePresenterCommand = useCallback((command) => {
    if (command === 'next') state.goNext();
    if (command === 'prev') state.goPrev();
  }, [state.goNext, state.goPrev]);

  const { openPresenterWindow } = useSyncBroadcaster({
    currentIndex: state.currentIndex,
    buildStep: state.buildStep,
    totalSlides: state.totalSlides,
    onCommand: handlePresenterCommand,
  });

  const toggleOverview = useCallback((force) => {
    setShowOverview(prev => force !== undefined ? force : !prev);
  }, []);

  const { isPresenter, token } = usePresenterMode();

  const { isFollowing } = usePresenterControlled({
    currentIndex: state.currentIndex,
    buildStep: state.buildStep,
    setSlidePosition: state.setSlidePosition,
    isPresenter,
    token,
    presentationId: 'filtering',
  });

  const noop = useCallback(() => {}, []);
  const goNext = isFollowing ? noop : state.goNext;
  const goPrev = isFollowing ? noop : state.goPrev;

  const goToLanding = useCallback(() => {
    if (isPresenter) state.resetPosition();
    window.location.href = import.meta.env.BASE_URL + '../';
  }, [isPresenter, state.resetPosition]);

  const toggleNotes = useCallback(() => {
    openPresenterWindow();
  }, [openPresenterWindow]);

  useKeyboardNavigation({
    goNext,
    goPrev,
    toggleOverview: isFollowing ? noop : toggleOverview,
    toggleFullscreen,
    openPresenterWindow: toggleNotes,
    currentSlide: state.currentSlide,
    isPresenter,
    token,
  });

  useSwipeNavigation({
    goNext,
    goPrev,
  });

  const handleOverviewSelect = useCallback((index) => {
    state.goToSlide(index);
    setShowOverview(false);
  }, [state.goToSlide]);

  return (
    <div className="presentation">
      <ProgressBar current={state.currentIndex} total={state.totalSlides} />

      <div
        className="slide-stage"
        style={{
          width: designWidth,
          height: designHeight,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <AnimatePresence mode="wait">
          <SlideRenderer
            key={state.currentIndex}
            slide={state.currentSlide}
            buildStep={state.buildStep}
            direction={state.direction}
            sections={state.sections}
          />
        </AnimatePresence>
      </div>

      <Navigation
        currentIndex={state.currentIndex}
        totalSlides={state.totalSlides}
        flatSlides={state.flatSlides}
        sectionTitle={state.currentSlide?.sectionTitle}
        goNext={goNext}
        goPrev={goPrev}
        goToSlide={state.goToSlide}
        isFirst={state.isFirst}
        isLast={state.isLast}
        disabled={isFollowing}
      />

      <div className="toolbar-buttons">
        <button
          className="toolbar-btn"
          onClick={goToLanding}
          title="Back to landing page"
        >
          &#8592;
        </button>
        <button
          className="toolbar-btn"
          onClick={toggleFullscreen}
          title="Toggle fullscreen (F)"
        >
          {isFullscreen ? '⛶' : '⛶'}
        </button>
        <button
          className="toolbar-btn"
          onClick={toggleNotes}
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
