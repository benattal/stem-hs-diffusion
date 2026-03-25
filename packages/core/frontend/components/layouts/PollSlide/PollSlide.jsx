import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import usePollData from '../../../hooks/usePollData.js';
import { usePresenterMode } from '../../../hooks/usePresenterMode.jsx';
import './PollSlide.css';

export default function PollSlide({ slide }) {
  const { pollId, question, options, presetDistribution } = slide;
  const { submitVote, wasReset, clearReset } = usePollData(pollId, options, presetDistribution);
  const { isPresenter } = usePresenterMode();

  const storageKey = `poll-voted-${pollId}`;
  const [voted, setVoted] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? Number(stored) : null;
  });

  // Clear voted state only when the server explicitly signals a reset
  useEffect(() => {
    if (wasReset) {
      setVoted(null);
      localStorage.removeItem(storageKey);
      clearReset();
    }
  }, [wasReset, storageKey, clearReset]);

  // Sync voted state across windows/iframes via storage events
  useEffect(() => {
    function onStorage(e) {
      if (e.key === storageKey) {
        setVoted(e.newValue !== null ? Number(e.newValue) : null);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  const handleVote = useCallback(async (index) => {
    const previousIndex = voted;
    // In presenter mode, always allow voting (for testing).
    // In student mode, allow changing vote but not re-clicking the same option.
    if (!isPresenter && index === voted) return;
    setVoted(index);
    localStorage.setItem(storageKey, String(index));
    // In presenter mode, don't decrement the previous choice — just add votes for testing
    await submitVote(index, isPresenter ? undefined : previousIndex);
  }, [voted, storageKey, submitVote, isPresenter]);

  return (
    <div className="slide--poll" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <motion.p
        className="poll-question"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {question}
      </motion.p>

      <div className="poll-options">
        {options.map((option, i) => (
          <motion.button
            key={i}
            className={`poll-option ${voted === i ? 'poll-option--selected' : ''}`}
            onClick={() => handleVote(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="poll-option-letter">{String.fromCharCode(65 + i)}</span>
            <span className="poll-option-text">{option}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
