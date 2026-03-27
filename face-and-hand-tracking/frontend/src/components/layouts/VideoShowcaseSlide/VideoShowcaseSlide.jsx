import { motion, AnimatePresence } from 'framer-motion';
import './VideoShowcaseSlide.css';

export default function VideoShowcaseSlide({ slide, buildStep }) {
  const items = slide.media || [];
  const hasBuildSteps = slide.buildSteps && slide.buildSteps.length > 0;

  if (hasBuildSteps) {
    const current = items[buildStep] || items[0];
    return (
      <div className="slide--video-showcase slide--video-showcase--fullscreen">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {slide.title}
        </motion.h2>

        <div className="vs-fullscreen-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={buildStep}
              className="vs-fullscreen-item"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {current.type === 'video' ? (
                <video src={current.src} autoPlay muted loop playsInline />
              ) : (
                <img src={current.src} alt="" />
              )}
              {current.caption && (
                <span className="vs-caption">{current.caption}</span>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="vs-dots">
            {items.map((_, i) => (
              <div key={i} className={`vs-dot${i === buildStep ? ' vs-dot--active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hasBullets = slide.bullets && slide.bullets.length > 0;
  const singleVideoWithBullets = items.length === 1 && hasBullets;

  if (singleVideoWithBullets) {
    const m = items[0];
    return (
      <div className="slide--video-showcase slide--video-showcase--side">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {slide.title}
        </motion.h2>
        <div className="vs-side-body">
          <motion.div
            className="vs-side-video"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {m.type === 'video' ? (
              <video src={m.src} autoPlay muted loop playsInline />
            ) : (
              <img src={m.src} alt="" />
            )}
          </motion.div>
          <motion.div
            className="vs-bullets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
          >
            {slide.bullets.map((b, i) => (
              <span key={i} className="vs-bullet">{b}</span>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  const cols = items.length <= 2 ? items.length : 2;

  return (
    <div className="slide--video-showcase">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="vs-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <div className="vs-grid" style={{ '--vs-cols': cols }}>
        {items.map((m, i) => (
          <motion.div
            key={i}
            className="vs-item"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {m.type === 'video' ? (
              <video src={m.src} autoPlay muted loop playsInline />
            ) : (
              <img src={m.src} alt="" loading="lazy" />
            )}
            {m.caption && (
              <span className="vs-caption">{m.caption}</span>
            )}
          </motion.div>
        ))}
      </div>

      {hasBullets && (
        <motion.div
          className="vs-bullets"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {slide.bullets.map((b, i) => (
            <span key={i} className="vs-bullet">{b}</span>
          ))}
        </motion.div>
      )}
    </div>
  );
}
