import { motion } from 'framer-motion';
import usePollData from '../../../hooks/usePollData.js';
import './PollResultsSlide.css';

const BAR_COLORS = [
  'var(--accent)',
  'var(--accent-secondary)',
  'var(--warning)',
  'var(--success)',
  '#e84393',
  '#fd79a8',
];

export default function PollResultsSlide({ slide }) {
  const { pollId, options, presetDistribution } = slide;
  const { counts, totalVotes, isLive } = usePollData(pollId, options, presetDistribution);

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="slide--poll-results" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.question && (
        <motion.p
          className="poll-results-question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.question}
        </motion.p>
      )}

      <div className="poll-results-chart">
        {options.map((option, i) => {
          const pct = totalVotes > 0 ? (counts[i] / totalVotes) * 100 : 0;
          const widthPct = (counts[i] / maxCount) * 100;

          return (
            <motion.div
              key={i}
              className="poll-result-row"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            >
              <div className="poll-result-label">{option}</div>
              <div className="poll-result-bar-container">
                <motion.div
                  className="poll-result-bar"
                  style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPct}%` }}
                  transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 60, damping: 15 }}
                />
                <span className="poll-result-pct">
                  {pct.toFixed(0)}%
                </span>
              </div>
              <span className="poll-result-count">{counts[i]}</span>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="poll-results-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <span className="poll-total">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </span>
        <span className={`poll-status ${isLive ? 'poll-status--live' : ''}`}>
          {isLive ? '● Live' : '○ Preset data'}
        </span>
      </motion.div>
    </div>
  );
}
