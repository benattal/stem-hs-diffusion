import { motion, AnimatePresence } from 'framer-motion';

export default function ProgressiveBuildSlide({ slide, buildStep }) {
  const steps = slide.buildSteps || [];

  return (
    <div className="slide--progressive">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="build-steps">
        <AnimatePresence>
          {steps.map((step, i) => {
            if (i > buildStep) return null;
            return (
              <motion.div
                key={i}
                className="build-step"
                initial={{ y: 30, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="build-step-header">
                  <span className="build-step-label">{step.label}</span>
                  {step.description && (
                    <span className="build-step-description">— {step.description}</span>
                  )}
                </div>
                {step.media && step.media.length > 0 && (
                  <motion.div
                    className="build-step-media"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {step.media.map((m, j) => (
                      m.type === 'video' ? (
                        <video key={j} src={m.src} autoPlay muted loop playsInline />
                      ) : (
                        <img key={j} src={m.src} alt="" loading="lazy" />
                      )
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
