import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import usePollData from '@core/hooks/usePollData.js';
import { usePresenterMode } from '@core/hooks/usePresenterMode.jsx';
import './ImagePollSlide.css';

export default function ImagePollSlide({ slide }) {
  const { pollId, title, imageA, imageB, options, presetDistribution } = slide;
  const { submitVote, wasReset, clearReset } = usePollData(pollId, options, presetDistribution);
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

  const images = [imageA, imageB];

  return (
    <div className="slide--image-poll" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="image-poll-images">
        {images.map((img, i) => (
          <motion.div
            key={i}
            className={`image-poll-card ${voted === i ? 'image-poll-card--selected' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
          >
            <img src={img.src} alt={img.label} />
            <motion.button
              className={`image-poll-vote-btn ${voted === i ? 'image-poll-vote-btn--selected' : ''}`}
              onClick={() => handleVote(i)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="poll-option-letter">{String.fromCharCode(65 + i)}</span>
              {img.label}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
