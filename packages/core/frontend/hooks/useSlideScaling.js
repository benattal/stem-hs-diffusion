import { useState, useEffect, useCallback } from 'react';

const DESIGN_WIDTH = 1280;
const DESIGN_HEIGHT = 720;
const DESKTOP_BREAKPOINT = 769;

export default function useSlideScaling() {
  const [state, setState] = useState(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
      scale: Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT),
      isDesktop: vw >= DESKTOP_BREAKPOINT,
    };
  });

  const update = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    setState({
      scale: Math.min(vw / DESIGN_WIDTH, vh / DESIGN_HEIGHT),
      isDesktop: vw >= DESKTOP_BREAKPOINT,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  return {
    scale: state.scale,
    isDesktop: state.isDesktop,
    designWidth: DESIGN_WIDTH,
    designHeight: DESIGN_HEIGHT,
  };
}
