import { useEffect, useRef, useCallback } from 'react';

const CHANNEL_NAME = 'vision-workshop-presenter';

/**
 * Used by the main presentation window to broadcast state
 * and receive navigation commands from the presenter window.
 */
export function useSyncBroadcaster({ currentIndex, buildStep, totalSlides, onCommand }) {
  const channelRef = useRef(null);
  const stateRef = useRef({ currentIndex, buildStep, totalSlides });
  const onCommandRef = useRef(onCommand);

  // Keep refs in sync so handlers always have the latest values
  useEffect(() => {
    stateRef.current = { currentIndex, buildStep, totalSlides };
  }, [currentIndex, buildStep, totalSlides]);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === 'command') {
        if (event.data.command === 'request-state') {
          channel.postMessage({ type: 'state', ...stateRef.current });
        } else {
          onCommandRef.current?.(event.data.command);
        }
      }
    };

    return () => channel.close();
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
    window.open(url, 'presenter-notes', 'width=1100,height=700');
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
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event) => {
      if (event.data.type === 'state') {
        onStateUpdate(event.data);
      }
    };

    // Ask the main window to send its current state
    channel.postMessage({ type: 'command', command: 'request-state' });

    return () => channel.close();
  }, [onStateUpdate]);

  const sendCommand = useCallback((command) => {
    channelRef.current?.postMessage({ type: 'command', command });
  }, []);

  return { sendCommand };
}
