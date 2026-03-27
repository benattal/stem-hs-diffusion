import { useState, useEffect, useCallback } from 'react';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
export default function useSlideScaling() {
  const [scale, setScale] = useState(() => {
    return Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  });

  const update = useCallback(() => {
    setScale(Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT));
  }, []);

  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  return {
    scale,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
  };
}
