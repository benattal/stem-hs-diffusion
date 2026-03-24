import { motion } from 'framer-motion';
import './MediaSlide.css';

export default function MediaSlide({ slide }) {
  return (
    <div className="slide--media">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="media-grid">
        {slide.media.map((m, i) => (
          <motion.div
            key={i}
            className="media-grid-item"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 * i, duration: 0.4 }}
          >
            {m.type === 'video' ? (
              <video src={m.src} autoPlay muted loop playsInline controls />
            ) : (
              <img src={m.src} alt="" loading="lazy" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
