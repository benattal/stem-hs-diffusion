import { motion, AnimatePresence } from 'framer-motion';
import './ImagePipelineSlide.css';

export default function ImagePipelineSlide({ slide, buildStep }) {
  const { title, steps = [], summary } = slide;
  const visibleStep = buildStep ?? 0;

  return (
    <div className="slide--image-pipeline">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {title}
      </motion.h2>

      <div className="ip-grid">
        {steps.map((step, i) => {
          const visible = visibleStep >= i;
          const isFinal = i === steps.length - 1;

          return (
            <div key={step.label} className="ip-step-group">
              {/* Arrow before each step except the first */}
              {i > 0 && (
                <motion.div
                  className="ip-arrow"
                  initial={false}
                  animate={{ opacity: visible ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="32" height="24" viewBox="0 0 32 24">
                    <path d="M0 12 L22 12 M16 4 L24 12 L16 20" stroke="var(--text-secondary)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              )}

              <motion.div
                className={`ip-panel${isFinal ? ' ip-panel--final' : ''}`}
                initial={false}
                animate={{ opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className={`ip-label${isFinal ? ' ip-label--accent' : ''}`}>
                  {step.label}
                </span>
                <img src={step.src} alt={step.label} className="ip-image" />
                {step.description && (
                  <p className="ip-description">{step.description}</p>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {visibleStep >= steps.length - 1 && summary && (
          <motion.p
            className="ip-summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
