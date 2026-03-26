import { motion } from 'framer-motion';
import './SplitRevealSlide.css';

export default function SplitRevealSlide({ slide, buildStep }) {
  const panels = slide.panels || [];
  const visibleCount = buildStep != null ? buildStep + 1 : panels.length;
  const showConclusion = slide.conclusion && visibleCount > panels.length;

  return (
    <div className="slide--split-reveal">
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="sr-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <div className="sr-panels">
        {panels.map((panel, i) => {
          const visible = i < visibleCount;
          return (
            <motion.div
              key={panel.label || i}
              className={`sr-panel ${panel.highlight ? 'sr-panel--highlight' : ''}`}
              initial={false}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ pointerEvents: visible ? 'auto' : 'none' }}
            >
              {panel.media && (
                <div className="sr-panel-media">
                  {panel.media.map((m, mi) => (
                    <img key={mi} src={m.src} alt="" loading="lazy" />
                  ))}
                </div>
              )}
              <div className="sr-panel-text">
                {panel.label && <h3>{panel.label}</h3>}
                {panel.description && <p>{panel.description}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        className="sr-conclusion"
        initial={false}
        animate={{ opacity: showConclusion ? 1 : 0 }}
        transition={{ duration: 0.45 }}
        style={{ pointerEvents: showConclusion ? 'auto' : 'none' }}
      >
        {slide.conclusion || '\u00A0'}
      </motion.div>
    </div>
  );
}
