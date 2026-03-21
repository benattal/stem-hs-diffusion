import { motion } from 'framer-motion';
import './DiagramSlide.css';

export default function DiagramSlide({ slide }) {
  return (
    <div className="slide--diagram">
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="diagram-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      {slide.media && slide.media.length > 0 && (
        <motion.div
          className="diagram-media"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {slide.media.map((m, i) => (
            <div key={i} className="diagram-media-item">
              {m.type === 'video' ? (
                <video src={m.src} autoPlay muted loop playsInline controls />
              ) : (
                <img src={m.src} alt="" loading="lazy" />
              )}
              {m.caption && <span className="diagram-caption">{m.caption}</span>}
            </div>
          ))}
        </motion.div>
      )}

      {slide.example && (
        <motion.div
          className="prompt-example"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <div className="prompt-box prompt-box--positive">
            <div className="prompt-box-label">Positive Prompt</div>
            <div className="prompt-box-text">"{slide.example.positive}"</div>
          </div>
          <div className="prompt-box prompt-box--negative">
            <div className="prompt-box-label">Negative Prompt</div>
            <div className="prompt-box-text">"{slide.example.negative}"</div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
