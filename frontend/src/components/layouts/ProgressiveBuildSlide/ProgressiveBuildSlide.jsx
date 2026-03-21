import { motion, AnimatePresence } from 'framer-motion';
import './ProgressiveBuildSlide.css';

export default function ProgressiveBuildSlide({ slide, buildStep }) {
  const steps = slide.buildSteps || [];
  const expandable = slide.expandable;

  // For expandable slides, each step has two phases: appear then expand
  // buildStep 0 = step 0 collapsed, 1 = step 0 expanded,
  // 2 = step 1 collapsed, 3 = step 1 expanded, etc.
  const visibleCount = expandable
    ? Math.floor(buildStep / 2) + 1
    : buildStep + 1;
  const expandedIndex = expandable && buildStep % 2 === 1
    ? Math.floor(buildStep / 2)
    : -1;

  return (
    <div className="slide--progressive">
      <h2>{slide.title}</h2>

      <div className={`build-steps ${expandedIndex >= 0 ? 'build-steps--has-expanded' : ''}`}>
        <AnimatePresence>
          {steps.map((step, i) => {
            if (i >= visibleCount) return null;
            const isExpanded = i === expandedIndex;
            return (
              <motion.div
                key={i}
                className={`build-step ${isExpanded ? 'build-step--expanded' : ''}`}
                layout
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="build-step-header">
                  <span className="build-step-label">{step.label}</span>
                  {step.description && (
                    <span className="build-step-description">— {step.description}</span>
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
