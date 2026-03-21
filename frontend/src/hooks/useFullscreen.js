import { useState, useCallback, useEffect } from 'react';

export default function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  return { isFullscreen, toggleFullscreen };
}
