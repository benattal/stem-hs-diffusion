import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function usePollData(pollId, options, presetDistribution) {
  const [counts, setCounts] = useState(() => new Array(options?.length || 0).fill(0));
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [wasReset, setWasReset] = useState(false);

  // Stable refs to avoid re-running the effect when array references change
  const optionsRef = useRef(options);
  const presetRef = useRef(presetDistribution);
  optionsRef.current = options;
  presetRef.current = presetDistribution;

  // Initialize poll on backend and open SSE stream — keyed only on pollId
  useEffect(() => {
    if (!pollId) return;

    let cancelled = false;
    let eventSource;

    async function init() {
      try {
        const initRes = await fetch(`${API_BASE}/api/poll/${pollId}/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options: optionsRef.current, initialCounts: presetRef.current }),
        });
        if (cancelled) return;

        const initData = await initRes.json();
        if (cancelled) return;

        setCounts(initData.counts);

        eventSource = new EventSource(`${API_BASE}/api/poll/${pollId}/stream`);

        eventSource.onopen = () => {
          if (!cancelled) {
            setIsConnected(true);
            setIsLive(true);
          }
        };

        eventSource.onmessage = (event) => {
          if (cancelled) return;
          const data = JSON.parse(event.data);
          setCounts(data.counts);
          if (data.event === 'reset') {
            setWasReset(true);
          }
        };

        eventSource.onerror = () => {
          if (!cancelled) setIsConnected(false);
        };
      } catch {
        if (!cancelled) setIsConnected(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (eventSource) eventSource.close();
    };
  }, [pollId]);

  const totalVotes = counts.reduce((sum, c) => sum + c, 0);

  const submitVote = useCallback(async (optionIndex, previousIndex) => {
    try {
      await fetch(`${API_BASE}/api/poll/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex, previousIndex }),
      });
      return true;
    } catch {
      return false;
    }
  }, [pollId]);

  const clearReset = useCallback(() => setWasReset(false), []);

  return { counts, totalVotes, isConnected, isLive, submitVote, wasReset, clearReset };
}
