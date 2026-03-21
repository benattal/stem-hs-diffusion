import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import { getFlatSlides, presentation } from '../data/presentation.js';
import { getNotesForSlide } from '../data/notesLoader.js';
import { useSyncReceiver } from '../hooks/usePresentationSync.js';

export default function PresenterView() {
  const flatSlides = useMemo(() => getFlatSlides(presentation), []);
  const [state, setState] = useState({
    currentIndex: 0,
    buildStep: 0,
    totalSlides: flatSlides.length,
  });
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  const onStateUpdate = useCallback((data) => {
    setState(data);
  }, []);

  const { sendCommand } = useSyncReceiver(onStateUpdate);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation in presenter window sends commands to main window
  useEffect(() => {
    function handleKeyDown(e) {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          sendCommand('next');
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          sendCommand('prev');
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sendCommand]);

  const currentSlide = flatSlides[state.currentIndex];
  const nextSlide = flatSlides[state.currentIndex + 1];
  const notes = currentSlide
    ? getNotesForSlide(currentSlide.id, state.buildStep)
    : '';

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <div className="presenter-view">
      <div className="presenter-header">
        <div className="presenter-timer">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="presenter-slide-info">
          Slide {state.currentIndex + 1} / {state.totalSlides}
          {currentSlide?.buildSteps?.length > 0 && (
            <span className="presenter-build-info">
              {' '}(step {state.buildStep + 1}/{currentSlide.buildSteps.length})
            </span>
          )}
        </div>
        <div className="presenter-nav-buttons">
          <button onClick={() => sendCommand('prev')}>← Prev</button>
          <button onClick={() => sendCommand('next')}>Next →</button>
        </div>
      </div>

      <div className="presenter-body">
        <div className="presenter-current">
          <h3>Current Slide</h3>
          <div className="presenter-slide-preview">
            <div className="preview-section">{currentSlide?.sectionTitle}</div>
            <div className="preview-title">{currentSlide?.title || currentSlide?.layout}</div>
            {currentSlide?.buildSteps && (
              <div className="preview-build-step">
                Build: {currentSlide.buildSteps[state.buildStep]?.label}
              </div>
            )}
          </div>
          <div className="presenter-notes">
            <h4>Notes</h4>
            <div className="presenter-notes-content">
              <Markdown>{notes || '*(No notes)*'}</Markdown>
            </div>
          </div>
        </div>

        <div className="presenter-next">
          <h3>Up Next</h3>
          {nextSlide ? (
            <div className="presenter-slide-preview presenter-slide-preview--next">
              <div className="preview-section">{nextSlide.sectionTitle}</div>
              <div className="preview-title">{nextSlide.title || nextSlide.layout}</div>
            </div>
          ) : (
            <div className="presenter-slide-preview presenter-slide-preview--next">
              <div className="preview-title">End of presentation</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
