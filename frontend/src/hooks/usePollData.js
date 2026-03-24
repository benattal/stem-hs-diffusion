import { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function usePollData(pollId, options, presetDistribution) {
  const [counts, setCounts] = useState(presetDistribution || []);
  const [isConnected, setIsConnected] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const initRef = useRef(false);
  const receivedData = useRef(false);

  // Initialize poll on backend and open SSE stream
  useEffect(() => {
    if (!pollId || !options) return;

    let eventSource;
    receivedData.current = false;

    async function init() {
      try {
        // Initialize the poll on the backend (idempotent)
        // Send presetDistribution as initial counts so the server starts with real data
        await fetch(`${API_BASE}/api/poll/${pollId}/init`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ options, initialCounts: presetDistribution }),
        });

        // Open SSE stream
        eventSource = new EventSource(`${API_BASE}/api/poll/${pollId}/stream`);

        eventSource.onopen = () => {
          setIsConnected(true);
          setIsLive(true);
        };

        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          receivedData.current = true;
          setCounts(data.counts);
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          // Only fall back to preset if we never got live data from the server
          if (!receivedData.current && presetDistribution) {
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
