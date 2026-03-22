import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import EmbeddingScatterPlot from '../EmbeddingSpaceSlide/EmbeddingScatterPlot.jsx';
import { embeddingPairs, findNearest, getColorForPair } from '../EmbeddingSpaceSlide/embeddingData.js';
import DiffusionSequence from '../../shared/DiffusionSequence.jsx';
import './DiffusionModelSlide.css';

const PLOT_W = 220;
const PLOT_H = 180;

export default function DiffusionModelSlide({ slide }) {
  const [activeId, setActiveId] = useState('cat');
  const activePair = embeddingPairs.find((p) => p.id === activeId) || embeddingPairs[0];
  const color = getColorForPair(activePair);

  const handleHover = useCallback((x, y) => {
    const nearest = findNearest(x, y);
    if (nearest && nearest.id !== activeId) {
      setActiveId(nearest.id);
    }
  }, [activeId]);

  return (
    <div className="slide--diffusion-model" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="dm-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      <motion.div
        className="dm-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Left: vertical flow pipeline */}
        <div className="dm-flow">
          <div className="dm-flow-numbers" style={{ borderColor: color }}>
            <span className="dm-flow-numbers-label">From embedding space:</span>
            <span className="dm-flow-numbers-value" style={{ color }}>
              ({activePair.x.toFixed(2)}, {activePair.y.toFixed(2)})
            </span>
          </div>

          <div className="dm-flow-arrow">&darr;</div>

          <div className="dm-flow-model">
            <div className="dm-flow-model-inner">
              <span className="dm-flow-model-icon">&#9881;</span>
              <span className="dm-flow-model-label">Diffusion Model</span>
            </div>
            <div className="dm-flow-model-sub">
              Sees noisy image + numbers describing what the image should be.
              Predicts a slightly less noisy version at each step.
            </div>
          </div>

          <div className="dm-flow-arrow">&darr;</div>

          <div className="dm-flow-output">
            <DiffusionSequence
              imageSrc={activePair.image}
              frameCount={slide.sequenceFrames || 7}
              reverse={true}
              size="normal"
            />
          </div>
        </div>

        {/* Right: mini embedding graph */}
        <div className="dm-mini-plot">
          <div className="dm-mini-plot-label">Select a concept:</div>
          <div className="dm-mini-plot-container">
            <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="dm-mini-plot-svg">
              <EmbeddingScatterPlot
                pairs={embeddingPairs}
                activeId={activeId}
                onHover={handleHover}
                width={PLOT_W}
                height={PLOT_H}
              />
            </svg>
          </div>
          <div className="dm-mini-plot-active" style={{ borderColor: color }}>
            <img src={activePair.image} alt="" className="dm-mini-plot-img" />
            <span className="dm-mini-plot-caption" style={{ color }}>&ldquo;{activePair.caption}&rdquo;</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
