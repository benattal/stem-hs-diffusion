import { motion, AnimatePresence } from 'framer-motion';
import './CardGridSlide.css';

export default function CardGridSlide({ slide, buildStep }) {
  const cards = slide.cards || [];
  const buildSteps = slide.buildSteps || [];
  const isImageMode = buildSteps.length > 0 && buildSteps[0]?.id === 'image';

  if (isImageMode) {
    // Flatten all images from all cards with their card labels
    const allImages = cards.flatMap(card =>
      (card.media || []).map(m => ({ ...m, cardLabel: card.label }))
    );
    const idx = Math.min(buildStep ?? 0, allImages.length - 1);
    const current = allImages[idx];

    return (
      <div className="slide--card-grid slide--card-grid--image">
        <motion.h2
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {slide.title}
        </motion.h2>

        <div className="cg-image-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              className="cg-image-item"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {current?.src?.endsWith('.gif') || current?.type === 'image' ? (
                <img src={current.src} alt="" />
              ) : (
                <video src={current.src} autoPlay muted loop playsInline />
              )}
            </motion.div>
          </AnimatePresence>

          <motion.div
            key={`label-${idx}`}
            className="cg-image-label"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {current?.cardLabel}
          </motion.div>

          <div className="vs-dots">
            {allImages.map((_, i) => (
              <div key={i} className={`vs-dot${i === idx ? ' vs-dot--active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const visibleCount = buildStep != null ? buildStep + 1 : cards.length;

  return (
    <div className="slide--card-grid">
      <motion.h2
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="cg-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <div className="cg-grid" style={{ '--cg-cols': Math.min(cards.length, 4) }}>
        {cards.map((card, i) => {
          const visible = i < visibleCount;
          return (
            <motion.div
              key={card.label}
              className="cg-card"
              initial={false}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ pointerEvents: visible ? 'auto' : 'none' }}
            >
              {card.media && card.media.length > 0 && (
                <div className="cg-card-media">
                  {card.media.map((m, mi) => (
                    m.type === 'video' ? (
                      <video key={mi} src={m.src} autoPlay muted loop playsInline />
                    ) : m.src.endsWith('.gif') ? (
                      <img key={mi} src={m.src} alt="" />
                    ) : (
                      <img key={mi} src={m.src} alt="" loading="lazy" />
                    )
                  ))}
                </div>
              )}
              <div className="cg-card-body">
                <div className="cg-card-number">{i + 1}</div>
                <div className="cg-card-text">
                  <h3>{card.label}</h3>
                  {card.description && <p>{card.description}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
