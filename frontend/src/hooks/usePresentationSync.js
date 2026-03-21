import { useEffect, useRef, useCallback } from 'react';

const CHANNEL_NAME = 'vision-workshop-presenter';

/**
 * Used by the main presentation window to broadcast state
 * and receive navigation commands from the presenter window.
 */
export function useSyncBroadcaster({ currentIndex, buildStep, totalSlides }) {
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    return () => channelRef.current?.close();
  }, []);

  // Broadcast state on every change
  useEffect(() => {
    channelRef.current?.postMessage({
      type: 'state',
      currentIndex,
      buildStep,
      totalSlides,
    });
  }, [currentIndex, buildStep, totalSlides]);

  const openPresenterWindow = useCallback(() => {
    const url = `${window.location.origin}${window.location.pathname}?mode=presenter`;
    window.open(url, 'presenter-notes', 'width=800,height=600');
  }, []);

  return { openPresenterWindow };
}

/**
 * Used by the presenter notes window to receive state
 * and send navigation commands back.
 */
export function useSyncReceiver(onStateUpdate) {
  const channelRef = useRef(null);

  useEffect(() => {
    channelRef.current = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current.onmessage = (event) => {
      if (event.data.type === 'state') {
        onStateUpdate(event.data);
      }
    };
    return () => channelRef.current?.close();
  }, [onStateUpdate]);

  const sendCommand = useCallback((command) => {
    channelRef.current?.postMessage({ type: 'command', command });
  }, []);

  return { sendCommand };
}
