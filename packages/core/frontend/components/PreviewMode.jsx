import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getFlatSlides, presentation } from '@app/data/presentation.js';
import SlideRenderer from '@app/components/SlideRenderer.jsx';

/**
 * Minimal slide renderer used inside the presenter view iframe.
 * Controlled entirely via postMessage from the parent window.
 */
export default function PreviewMode() {
  const flatSlides = useMemo(() => getFlatSlides(presentation), []);
  const sections = useMemo(() => presentation.sections, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [buildStep, setBuildStep] = useState(0);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'presenter-preview-state') {
        setCurrentIndex(e.data.currentIndex);
        setBuildStep(e.data.buildStep);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const slide = flatSlides[currentIndex];
  if (!slide) return null;

  return (
    <div className="presentation preview-mode">
      <AnimatePresence mode="wait">
        <SlideRenderer
          key={currentIndex}
          slide={slide}
          buildStep={buildStep}
          direction={1}
          sections={sections}
        />
      </AnimatePresence>
    </div>
  );
}
