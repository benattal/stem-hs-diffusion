import { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function useKeyboardNavigation({ goNext, goPrev, toggleOverview, toggleFullscreen, openPresenterWindow, currentSlide, isPresenter, token }) {
  useEffect(() => {
    function handleKeyDown(e) {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Backspace':
          e.preventDefault();
          goPrev();
          break;
        case 'o':
        case 'O':
          e.preventDefault();
          toggleOverview();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen?.();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          openPresenterWindow?.();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          if (isPresenter && currentSlide?.pollId) {
            fetch(`${API_BASE}/api/poll/${currentSlide.pollId}/reset`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          break;
        case 'Escape':
          e.preventDefault();
          toggleOverview(false);
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, toggleOverview, toggleFullscreen, openPresenterWindow, currentSlide, isPresenter, token]);
}
