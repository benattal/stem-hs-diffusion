import { motion } from 'framer-motion';
import './TwoColumnSlide.css';

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function TwoColumnSlide({ slide, buildStep }) {
  const bullets = slide.bullets || [];
  const visibleCount = buildStep + 1;

  return (
    <div className="slide--two-column">
      <motion.h2
        className="tc-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <div className="tc-body">
        <div className="tc-left">
          <ul className="tc-bullets">
            {bullets.map((text, i) => {
              if (i >= visibleCount) return null;
              return (
                <motion.li
                  key={i}
                  className="tc-bullet"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                >
                  <span className="tc-bullet-icon">▸</span>
                  <span>{parseBold(text)}</span>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <motion.div
          className="tc-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {slide.imageSrc && (
            <img className="tc-image" src={slide.imageSrc} alt="" />
          )}
        </motion.div>
      </div>
    </div>
  );
}
