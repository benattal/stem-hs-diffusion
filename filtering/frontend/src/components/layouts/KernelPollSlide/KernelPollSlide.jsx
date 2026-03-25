import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import usePollData from '@core/hooks/usePollData.js';
import { usePresenterMode } from '@core/hooks/usePresenterMode.jsx';
import './KernelPollSlide.css';

function KernelGrid({ kernel, divisor }) {
  return (
    <div className="kernel-vis">
      <div
        className="kernel-vis-grid"
        style={{ gridTemplateColumns: `repeat(${kernel[0].length}, 1fr)` }}
      >
        {kernel.flat().map((val, i) => (
          <span key={i} className={`kernel-vis-cell ${val === 0 ? 'kernel-vis-cell--zero' : ''}`}>
            {val}
          </span>
        ))}
      </div>
      {divisor && <span className="kernel-vis-divisor">÷ {divisor}</span>}
    </div>
  );
}

export default function KernelPollSlide({ slide }) {
  const { pollId, title, question, kernelOptions, presetDistribution } = slide;
  const optionLabels = kernelOptions.map((_, i) => String.fromCharCode(65 + i));
  const { submitVote, wasReset, clearReset } = usePollData(pollId, optionLabels, presetDistribution);
  const { isPresenter } = usePresenterMode();

  const storageKey = `poll-voted-${pollId}`;
  const [voted, setVoted] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored !== null ? Number(stored) : null;
  });

  useEffect(() => {
    if (wasReset) {
      setVoted(null);
      localStorage.removeItem(storageKey);
      clearReset();
    }
  }, [wasReset, storageKey, clearReset]);

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
    if (!isPresenter && index === voted) return;
    setVoted(index);
    localStorage.setItem(storageKey, String(index));
    await submitVote(index, isPresenter ? undefined : previousIndex);
  }, [voted, storageKey, submitVote, isPresenter]);

  return (
    <div className="slide--kernel-poll" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      {question && (
        <motion.p
          className="kernel-poll-question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {question}
        </motion.p>
      )}

      <div className="kernel-poll-options">
        {kernelOptions.map((opt, i) => (
          <motion.button
            key={i}
            className={`kernel-poll-option ${voted === i ? 'kernel-poll-option--selected' : ''}`}
            onClick={() => handleVote(i)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="kernel-poll-letter">{String.fromCharCode(65 + i)}</span>
            <KernelGrid kernel={opt.kernel} divisor={opt.divisor} />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
