import { motion } from 'framer-motion';
import './FlowDiagramSlide.css';

function Arrow() {
  return (
    <div className="fd-arrow">
      <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 12h50" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
        <path d="M46 6l8 6-8 6" stroke="var(--accent)" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

export default function FlowDiagramSlide({ slide, buildStep }) {
  const steps = slide.steps || [];
  const visibleCount = buildStep != null ? buildStep + 1 : steps.length;

  return (
    <div className="slide--flow-diagram">
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="fd-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      <div className="fd-pipeline">
        {steps.map((step, i) => {
          const visible = i < visibleCount;
          const showArrow = i < steps.length - 1;
          const hasMultiMedia = step.media && step.media.length > 1;
          return (
            <div key={step.label} className="fd-step-group">
              <motion.div
                className={`fd-step ${step.accent ? 'fd-step--accent' : ''} ${hasMultiMedia ? 'fd-step--wide' : ''} ${step.zoom ? 'fd-step--zoom' : ''}`}
                initial={false}
                animate={{ opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ pointerEvents: visible ? 'auto' : 'none' }}
              >
                {step.media && step.media.length > 0 && (
                  <div className={`fd-step-media ${step.mediaStacked ? 'fd-step-media--stacked' : ''}`}>
                    {step.media.map((m, mi) => (
                      <div key={mi} className={`fd-media-item ${m.label ? 'fd-media-item--labeled' : ''}`}>
                        {m.type === 'video' ? (
                          <video src={m.src} autoPlay muted loop playsInline />
                        ) : (
                          <img src={m.src} alt="" loading="lazy" />
                        )}
                        {m.label && <span className="fd-media-label">{m.label}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {step.icon && <div className="fd-step-icon">{step.icon}</div>}
                {step.items && (
                  <div className="fd-step-items">
                    {step.items.map((item, ii) => (
                      <div key={ii} className="fd-step-item">
                        {item.icon && <span className="fd-item-icon">{item.icon}</span>}
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="fd-step-label">{step.label}</div>
                {step.sublabel && <div className="fd-step-sublabel">{step.sublabel}</div>}
              </motion.div>
              {showArrow && (
                <motion.div
                  initial={false}
                  animate={{ opacity: visible && i + 1 < visibleCount ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Arrow />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {slide.footnote && (
        <motion.p
          className="fd-footnote"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {slide.footnote}
        </motion.p>
      )}
    </div>
  );
}
