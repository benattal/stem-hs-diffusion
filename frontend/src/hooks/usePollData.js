import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function usePollData(pollId, options, presetDistribution) {
  const [counts, setCounts] = useState(presetDistribution || []);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const initRef = useRef(false);

  // Initialize poll on backend and open SSE stream
  useEffect(() => {
    if (!pollId || !options) return;

    let eventSource;

    async function init() {
      try {
        // Initialize the poll on the backend (idempotent)
        await fetch(`${API_BASE}/api/poll/${pollId}/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options }),
        });

        // Open SSE stream
        eventSource = new EventSource(`${API_BASE}/api/poll/${pollId}/stream`);

        eventSource.onopen = () => {
          setIsConnected(true);
          setIsLive(true);
        };

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setCounts(data.counts);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          // Fall back to preset if we lose connection
          if (presetDistribution) {
            setCounts(presetDistribution);
          }
        };

        initRef.current = true;
      } catch {
        // Backend unavailable — use preset
        setIsConnected(false);
        if (presetDistribution) {
          setCounts(presetDistribution);
        }
      }
    }

    init();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [pollId, options, presetDistribution]);

  const totalVotes = counts.reduce((sum, c) => sum + c, 0);

  const submitVote = async (optionIndex) => {
    try {
      await fetch(`${API_BASE}/api/poll/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex }),
      });
      return true;
    } catch {
      return false;
    }
  };

  return { counts, totalVotes, isConnected, isLive, submitVote };
}
