import { useEffect, useRef } from 'react';

export default function useSwipeNavigation({ goNext, goPrev }) {
  const touchStart = useRef(null);

  useEffect(() => {
    function handleTouchStart(e) {
      touchStart.current = e.touches[0].clientX;
    }

    function handleTouchEnd(e) {
      if (touchStart.current === null) return;
      const diff = touchStart.current - e.changedTouches[0].clientX;
      const threshold = 50;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) goNext();
        else goPrev();
      }
      touchStart.current = null;
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goNext, goPrev]);
}
