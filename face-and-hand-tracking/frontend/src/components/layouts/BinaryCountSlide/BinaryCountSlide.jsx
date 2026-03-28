import { motion, AnimatePresence } from 'framer-motion';
import './BinaryCountSlide.css';

export default function BinaryCountSlide({ slide, buildStep }) {
  const bits = slide.bits || 4;
  const placeValues = Array.from({ length: bits }, (_, i) => Math.pow(2, bits - 1 - i));
  const total = Math.pow(2, bits);
  const n = Math.min(buildStep ?? 0, total - 1);

  const bitValues = placeValues.map(v => ({ value: v, on: !!(n & v) }));
  const activeParts = bitValues.filter(b => b.on).map(b => b.value);
  const equation =
    activeParts.length === 0
      ? '0'
      : activeParts.join(' + ') + ' = ' + n;

  return (
    <div className="slide--binary-count">
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slide.title}
      </motion.h2>

      <div className="bc-display">
        {/* Place value labels */}
        <div className="bc-labels">
          {bitValues.map((b, i) => (
            <motion.div
              key={i}
              className={`bc-label${b.on ? ' bc-label--on' : ''}`}
              animate={{ color: b.on ? 'var(--accent)' : 'var(--text-secondary)' }}
              transition={{ duration: 0.25 }}
            >
              {b.value}
            </motion.div>
          ))}
        </div>

        {/* Bit boxes */}
        <div className="bc-bits">
          {bitValues.map((b, i) => (
            <AnimatePresence mode="wait" key={i}>
              <motion.div
                key={`${i}-${b.on}`}
                className={`bc-bit${b.on ? ' bc-bit--on' : ''}`}
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                {b.on ? '1' : '0'}
              </motion.div>
            </AnimatePresence>
          ))}
        </div>

        {/* Decimal result */}
        <AnimatePresence mode="wait">
          <motion.div
            key={n}
            className="bc-result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <span className="bc-equation">{equation}</span>
            <span className="bc-decimal">{n}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="bc-dots">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`bc-dot${i === n ? ' bc-dot--active' : ''}`} />
        ))}
      </div>
    </div>
  );
}
