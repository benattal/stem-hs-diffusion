import { motion, AnimatePresence } from 'framer-motion';
import './ProgressiveBuildSlide.css';

export default function ProgressiveBuildSlide({ slide, buildStep }) {
  const steps = slide.buildSteps || [];
  const visibleCount = buildStep + 1;

  const extraClass = slide.className || '';

  return (
    <div className={`slide--progressive ${extraClass}`}>
      <h2>{slide.title}</h2>

      <div className="build-steps">
        <AnimatePresence>
          {steps.map((step, i) => {
            if (i >= visibleCount) return null;
            return (
              <motion.div
                key={i}
                className="build-step"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="build-step-header">
                  <span className="build-step-label">{step.label}</span>
                  {step.description && (
                    <span className="build-step-description">{step.description}</span>
                  )}
                </div>
                {step.media && step.media.length > 0 && (
                  <div className="build-step-media">
                    {step.media.map((m, j) => (
                      m.type === 'video' ? (
                        <video key={j} src={m.src} autoPlay muted loop playsInline />
                      ) : m.type === 'gif' ? (
                        <img key={j} src={m.src} alt="" />
                      ) : (
                        <img key={j} src={m.src} alt="" loading="lazy" />
                      )
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
