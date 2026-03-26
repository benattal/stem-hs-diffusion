import { motion } from 'framer-motion';
import './RevealCompareSlide.css';

export default function RevealCompareSlide({ slide, buildStep }) {
  const steps = slide.buildSteps || [];
  const visibleCount = buildStep + 1;

  return (
    <div className="slide--reveal-compare">
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="rc-grid">
        {steps.map((step, i) => {
          const hasMedia = step.media && step.media.length > 0;
          const isTextOnly = !hasMedia;
          const isVisible = i < visibleCount;

          return (
            <motion.div
              key={i}
              className={`rc-card ${isTextOnly ? 'rc-card--highlight' : ''}`}
              initial={false}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
            >
              {hasMedia && (
                <div className="rc-media">
                  {step.media.map((m, j) => (
                    <div key={j} className="rc-media-item">
                      {m.type === 'video' ? (
                        <video src={m.src} autoPlay muted loop playsInline />
                      ) : (
                        <img src={m.src} alt="" loading="lazy" />
                      )}
                      {m.caption && <span className="rc-caption">{m.caption}</span>}
                    </div>
                  ))}
                </div>
              )}
              <div className="rc-text">
                <span className="rc-label">{step.label}</span>
                {step.description && (
                  <span className="rc-description">{step.description}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
