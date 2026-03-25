import { motion } from 'framer-motion';
import usePollData from '@core/hooks/usePollData.js';
import './KernelPollResultsSlide.css';

const BAR_COLORS = [
  'var(--accent)',
  'var(--accent-secondary)',
  'var(--warning)',
  'var(--success)',
  '#e84393',
];

function KernelGridSmall({ kernel, divisor }) {
  return (
    <span className="kernel-result-vis">
      <span
        className="kernel-result-grid"
        style={{ gridTemplateColumns: `repeat(${kernel[0].length}, 1fr)` }}
      >
        {kernel.flat().map((val, i) => (
          <span key={i} className={`kernel-result-cell ${val === 0 ? 'kernel-result-cell--zero' : ''}`}>
            {val}
          </span>
        ))}
      </span>
      {divisor && <span className="kernel-result-divisor">÷{divisor}</span>}
    </span>
  );
}

export default function KernelPollResultsSlide({ slide }) {
  const { pollId, kernelOptions, presetDistribution } = slide;
  const optionLabels = kernelOptions.map((_, i) => String.fromCharCode(65 + i));
  const { counts, totalVotes, isLive } = usePollData(pollId, optionLabels, presetDistribution);

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="slide--kernel-poll-results" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.question && (
        <motion.p
          className="kernel-results-question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.question}
        </motion.p>
      )}

      <div className="kernel-results-chart">
        {kernelOptions.map((opt, i) => {
          const pct = totalVotes > 0 ? (counts[i] / totalVotes) * 100 : 0;
          const widthPct = (counts[i] / maxCount) * 100;

          return (
            <motion.div
              key={i}
              className="kernel-result-row"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
            >
              <div className="kernel-result-label">
                <span className="kernel-result-letter">{String.fromCharCode(65 + i)}</span>
                <KernelGridSmall kernel={opt.kernel} divisor={opt.divisor} />
              </div>
              <div className="kernel-result-bar-area">
                <div className="kernel-result-bar-container">
                  <motion.div
                    className="kernel-result-bar"
                    style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct}%` }}
                    transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 60, damping: 15 }}
                  />
                </div>
                <span className="kernel-result-pct">{pct.toFixed(0)}%</span>
                <span className="kernel-result-count">{counts[i]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="kernel-results-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <span className="poll-total">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        <span className={`poll-status ${isLive ? 'poll-status--live' : ''}`}>
          {isLive ? '● Live' : '○ Preset data'}
        </span>
      </motion.div>
    </div>
  );
}
