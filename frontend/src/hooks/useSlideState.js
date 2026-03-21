import { useState, useCallback, useMemo, useEffect } from 'react';
import { presentation, getFlatSlides } from '../data/presentation.js';

function loadSaved(key, max) {
  try {
    const v = parseInt(sessionStorage.getItem(key), 10);
    return Number.isFinite(v) && v >= 0 && v < max ? v : 0;
  } catch { return 0; }
}

export default function useSlideState() {
  const flatSlides = useMemo(() => getFlatSlides(presentation), []);
  const [currentIndex, setCurrentIndex] = useState(() => loadSaved('slide-index', flatSlides.length));
  const [buildStep, setBuildStep] = useState(() => loadSaved('slide-build', 100));
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    sessionStorage.setItem('slide-index', currentIndex);
    sessionStorage.setItem('slide-build', buildStep);
  }, [currentIndex, buildStep]);

  const currentSlide = flatSlides[currentIndex];
  const totalSlides = flatSlides.length;

  // How many build steps does the current slide have?
  const maxBuildSteps = currentSlide?.buildSteps?.length || 0;

  const goNext = useCallback(() => {
    // If there are more build steps to reveal, advance the build step
    if (maxBuildSteps > 0 && buildStep < maxBuildSteps - 1) {
      setBuildStep(prev => prev + 1);
      setDirection(1);
      return;
    }
    // Otherwise, go to the next slide
    if (currentIndex < totalSlides - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
      setBuildStep(0);
    }
  }, [currentIndex, totalSlides, buildStep, maxBuildSteps]);

  const goPrev = useCallback(() => {
    // If we're mid-build, go back a build step
    if (buildStep > 0) {
      setBuildStep(prev => prev - 1);
      setDirection(-1);
      return;
    }
    // Otherwise, go to the previous slide
    if (currentIndex > 0) {
      setDirection(-1);
      const prevIndex = currentIndex - 1;
      const prevSlide = flatSlides[prevIndex];
      const prevMaxBuild = prevSlide?.buildSteps?.length || 0;
      setCurrentIndex(prevIndex);
      // Go to the last build step of the previous slide
      setBuildStep(prevMaxBuild > 0 ? prevMaxBuild - 1 : 0);
    }
  }, [currentIndex, buildStep, flatSlides]);

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < totalSlides) {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setBuildStep(0);
    }
  }, [currentIndex, totalSlides]);

  return {
    currentSlide,
    currentIndex,
    buildStep,
    direction,
    totalSlides,
    flatSlides,
    sections: presentation.sections,
    goNext,
    goPrev,
    goToSlide,
    isFirst: currentIndex === 0 && buildStep === 0,
    isLast: currentIndex === totalSlides - 1 && buildStep >= maxBuildSteps - 1,
  };
}
