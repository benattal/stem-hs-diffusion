import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.BASE_URL.replace(/\/$/, '');
const VOTING_DISABLED = import.meta.env.VITE_VOTING_DISABLED === 'true';

export default function useNumericPollData(pollId) {
  const [values, setValues] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!pollId) return;
    let cancelled = false;
    let eventSource;

    async function init() {
      try {
        await fetch(`${API_BASE}/api/numeric-poll/${pollId}/init`, { method: 'POST' });
        if (cancelled) return;

        const res = await fetch(`${API_BASE}/api/numeric-poll/${pollId}`);
        const data = await res.json();
        if (!cancelled) setValues(data.values || []);

        eventSource = new EventSource(`${API_BASE}/api/numeric-poll/${pollId}/stream`);
        eventSource.onopen = () => { if (!cancelled) setIsConnected(true); };
        eventSource.onmessage = (e) => {
          if (cancelled) return;
          const d = JSON.parse(e.data);
          setValues(d.values || []);
        };
        eventSource.onerror = () => { if (!cancelled) setIsConnected(false); };
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

  const submitValue = useCallback(async (value) => {
    if (VOTING_DISABLED) return false;
    try {
      await fetch(`${API_BASE}/api/numeric-poll/${pollId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      return true;
    } catch {
      return false;
    }
  }, [pollId]);

  return { values, isConnected, submitValue, votingDisabled: VOTING_DISABLED };
}
