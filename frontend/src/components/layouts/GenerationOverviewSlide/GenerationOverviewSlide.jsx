import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmbeddingScatterPlot from '../EmbeddingSpaceSlide/EmbeddingScatterPlot.jsx';
import { embeddingPairs, findNearest, getColorForPair } from '../EmbeddingSpaceSlide/embeddingData.js';
import DiffusionSequence from '../../shared/DiffusionSequence.jsx';
import './GenerationOverviewSlide.css';

const PLOT_W = 300;
const PLOT_H = 240;
const PAD = 30;

function toSvgX(x) { return PAD + x * (PLOT_W - 2 * PAD); }
function toSvgY(y) { return PAD + y * (PLOT_H - 2 * PAD); }

function AnnotatedEmbeddingPlot({ activePair, onHover }) {
  const cx = toSvgX(activePair.x);
  const cy = toSvgY(activePair.y);
  const color = getColorForPair(activePair);

  // Clamp annotation positions to stay within the plot
  const textLabelX = Math.max(70, Math.min(PLOT_W - 70, cx));
  const textLabelY = cy - 30;
  const thumbX = Math.min(cx + 18, PLOT_W - PAD - 44);
  const thumbY = Math.min(cy + 14, PLOT_H - PAD - 44);
  const thumbSize = 40;

  return (
    <div className="overview-annotated-plot" onClick={(e) => e.stopPropagation()}>
      <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="overview-annotated-svg">
        <EmbeddingScatterPlot
          pairs={embeddingPairs}
          activeId={activePair.id}
          onHover={onHover}
          width={PLOT_W}
          height={PLOT_H}
        />

        {/* Text callout */}
        <line
          x1={cx} y1={cy - 12}
          x2={textLabelX} y2={textLabelY + 8}
          stroke={color} strokeWidth={1.5}
        />
        <rect
          x={textLabelX - 65} y={textLabelY - 9}
          width={130} height={17} rx={4}
          fill="var(--bg-elevated)" stroke={color} strokeWidth={1}
        />
        <text
          x={textLabelX} y={textLabelY + 3}
          textAnchor="middle"
          fill={color}
          fontSize={7.5} fontWeight="600" fontFamily="var(--font)"
        >
          &ldquo;{activePair.caption}&rdquo;
        </text>

        {/* Image callout */}
        <line
          x1={cx + 4} y1={cy + 4}
          x2={thumbX} y2={thumbY}
          stroke={color} strokeWidth={1.5}
        />
        <rect
          x={thumbX - 1} y={thumbY - 1}
          width={thumbSize + 2} height={thumbSize + 2} rx={4}
          fill="none" stroke={color} strokeWidth={2}
        />
        <image
          href={activePair.image}
          x={thumbX} y={thumbY}
          width={thumbSize} height={thumbSize}
          clipPath="inset(0 round 3px)"
          preserveAspectRatio="xMidYMid slice"
        />
      </svg>
    </div>
  );
}

function EmbeddingPanel({ activePair, onHover }) {
  return (
    <div className="overview-panel overview-panel--embed">
      <div className="overview-panel-header">
        <span className="overview-panel-number">1</span>
        <span className="overview-panel-title">Text &amp; Images &rarr; Numbers</span>
      </div>
      <p className="overview-panel-desc">
        A model maps text and images to points in a shared number space.
      </p>
      <div className="overview-embed-plot">
        <AnnotatedEmbeddingPlot activePair={activePair} onHover={onHover} />
      </div>
    </div>
  );
}

function DiffusionPanel({ activePair }) {
  const color = getColorForPair(activePair);

  return (
    <div className="overview-panel overview-panel--diffusion">
      <div className="overview-panel-header">
        <span className="overview-panel-number">2</span>
        <span className="overview-panel-title">Numbers &rarr; Images</span>
      </div>
      <p className="overview-panel-desc">
        A diffusion model takes those numbers to produce an image.
      </p>

      <div className="overview-diffusion-flow">
        {/* Numbers input */}
        <div className="overview-flow-numbers" style={{ borderColor: color }}>
          <span className="overview-flow-numbers-label">From embedding space:</span>
          <span className="overview-flow-numbers-value" style={{ color }}>
            ({activePair.x.toFixed(2)}, {activePair.y.toFixed(2)})
          </span>
        </div>

        <div className="overview-flow-arrow">&darr;</div>

        {/* Diffusion model box */}
        <div className="overview-flow-model">
          <div className="overview-flow-model-inner">
            <span className="overview-flow-model-icon">&#9881;</span>
            <span className="overview-flow-model-label">Diffusion Model</span>
          </div>
          <div className="overview-flow-model-sub">Predicts less noisy image at each step</div>
        </div>

        <div className="overview-flow-arrow">&darr;</div>

        {/* Image sequence output */}
        <div className="overview-diffusion-visual">
          <DiffusionSequence
            imageSrc={activePair.image}
            frameCount={5}
            reverse={true}
            size="small"
          />
        </div>
      </div>
    </div>
  );
}

export default function GenerationOverviewSlide({ slide, buildStep }) {
  const visibleCount = buildStep + 1;
  const [activeId, setActiveId] = useState('cat');

  const activePair = embeddingPairs.find((p) => p.id === activeId) || embeddingPairs[0];

  const handleHover = useCallback((x, y) => {
    const nearest = findNearest(x, y);
    if (nearest && nearest.id !== activeId) {
      setActiveId(nearest.id);
    }
  }, [activeId]);

  return (
    <div className="slide--generation-overview" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="overview-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <div className="overview-panels">
        {/* Panel 1 */}
        <div className="overview-panel-slot overview-panel-slot--embed">
          <AnimatePresence>
            {visibleCount >= 1 && (
              <motion.div
                key="embed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%' }}
              >
                <EmbeddingPanel activePair={activePair} onHover={handleHover} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel 2 */}
        <div className="overview-panel-slot overview-panel-slot--diffusion">
          <AnimatePresence>
            {visibleCount >= 2 && (
              <motion.div
                key="diffusion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ height: '100%' }}
              >
                <DiffusionPanel activePair={activePair} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
