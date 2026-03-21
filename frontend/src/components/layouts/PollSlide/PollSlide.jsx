import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import usePollData from '../../../hooks/usePollData.js';
import './PollSlide.css';

export default function PollSlide({ slide }) {
  const { pollId, question, options, presetDistribution } = slide;
  const { submitVote } = usePollData(pollId, options, presetDistribution);

  const storageKey = `poll-voted-${pollId}`;
  const [voted, setVoted] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? Number(stored) : null;
  });

  const handleVote = useCallback(async (index) => {
    if (voted !== null) return;
    setVoted(index);
    localStorage.setItem(storageKey, String(index));
    await submitVote(index);
  }, [voted, storageKey, submitVote]);

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
            className={`poll-option ${voted === i ? 'poll-option--selected' : ''} ${voted !== null && voted !== i ? 'poll-option--dimmed' : ''}`}
            disabled={voted !== null}
            onClick={() => handleVote(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            whileHover={voted === null ? { scale: 1.03 } : {}}
            whileTap={voted === null ? { scale: 0.97 } : {}}
          >
            <span className="poll-option-letter">{String.fromCharCode(65 + i)}</span>
            <span className="poll-option-text">{option}</span>
          </motion.button>
        ))}
      </div>

      {voted !== null && (
        <motion.p
          className="poll-confirmation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Vote recorded! Results will be shown on the next slide.
        </motion.p>
      )}
    </div>
  );
}
