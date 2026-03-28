import { useEffect, useRef, useState } from 'react';

const presenterControlled = import.meta.env.VITE_PRESENTER_CONTROLLED === 'true';

/**
 * Syncs slide position between presenter and students via server SSE.
 *
 * - Presenter: broadcasts position to server on every change
 * - Student: subscribes to SSE stream and follows presenter's position
 *
 * Returns { isFollowing } — true when the student is being controlled by the presenter.
 */
export default function usePresenterControlled({
  currentIndex,
  buildStep,
  setSlidePosition,
  isPresenter,
  token,
  presentationId,
}) {
  const [isFollowing, setIsFollowing] = useState(false);
  const lastPostedRef = useRef(null);

  // Presenter: POST position to server on every change
  useEffect(() => {
    if (!presenterControlled || !isPresenter || !token) return;

    const key = `${currentIndex}:${buildStep}`;
    if (lastPostedRef.current === key) return;
    lastPostedRef.current = key;

    fetch(`${import.meta.env.BASE_URL}api/slide-sync/${presentationId}/position`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentIndex, buildStep }),
    }).catch(() => {});
  }, [currentIndex, buildStep, isPresenter, token, presentationId]);

  // Student: subscribe to SSE stream
  useEffect(() => {
    if (!presenterControlled || isPresenter) {
      setIsFollowing(false);
      return;
    }

    setIsFollowing(true);

    const url = `${import.meta.env.BASE_URL}api/slide-sync/${presentationId}/stream`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const { currentIndex: idx, buildStep: step } = JSON.parse(event.data);
        setSlidePosition(idx, step);
      } catch {}
    };

    es.onerror = () => {
      // EventSource will auto-reconnect
    };

    return () => es.close();
  }, [isPresenter, presentationId, setSlidePosition]);

  return { isFollowing };
}
