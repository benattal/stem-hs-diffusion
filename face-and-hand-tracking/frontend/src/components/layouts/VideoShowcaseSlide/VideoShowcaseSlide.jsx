import { motion } from 'framer-motion';
import './VideoShowcaseSlide.css';

export default function VideoShowcaseSlide({ slide }) {
  const items = slide.media || [];
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

      {slide.bullets && slide.bullets.length > 0 && (
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
