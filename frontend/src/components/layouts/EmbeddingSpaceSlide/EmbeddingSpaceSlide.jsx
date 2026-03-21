import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmbeddingScatterPlot from './EmbeddingScatterPlot.jsx';
import { embeddingPairs, findNearest } from './embeddingData.js';
import './EmbeddingSpaceSlide.css';

export default function EmbeddingSpaceSlide({ slide }) {
  const [activeId, setActiveId] = useState(null);
  const activePair = embeddingPairs.find((p) => p.id === activeId) || embeddingPairs[0];

  const handleHover = useCallback((x, y) => {
    const nearest = findNearest(x, y);
    if (nearest && nearest.id !== activeId) {
      setActiveId(nearest.id);
    }
  }, [activeId]);

  return (
    <div className="slide--embedding" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="embedding-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      <motion.div
        className="embedding-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="embedding-plot-container">
          <EmbeddingScatterPlot
            pairs={embeddingPairs}
            activeId={activeId}
            onHover={handleHover}
          />
          <p className="embedding-hint">Hover or move your cursor over the space</p>
        </div>

        <div className="embedding-preview">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePair.id}
              className="embedding-preview-inner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <img
                className="embedding-preview-image"
                src={activePair.image}
                alt={activePair.caption}
              />
              <p className="embedding-preview-caption">
                "{activePair.caption}"
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
