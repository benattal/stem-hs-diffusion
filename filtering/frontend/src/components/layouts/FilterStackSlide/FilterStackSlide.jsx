import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyConvolution } from '@app/utils/convolution.js';
import './FilterStackSlide.css';

const GALLERY_SIZE = 140;
const ORIGINAL_SIZE = 160;

function CnnDiagram({ layers, activeLayer, buildStep }) {
  const visible = buildStep >= 1;

  return (
    <motion.div
      className="fs-cnn"
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="fs-cnn-pipeline">
        <div className="fs-cnn-node fs-cnn-node--input">
          <div className="fs-cnn-node-icon">📷</div>
          <span className="fs-cnn-node-label">Input</span>
        </div>

        {layers.map((layer, i) => {
          const isActive = visible && i <= activeLayer;
          const isHighlighted = visible && i === activeLayer;
          return (
            <div key={i} className="fs-cnn-layer-group">
              <svg className="fs-cnn-arrow" width="40" height="20" viewBox="0 0 40 20">
                <line x1="0" y1="10" x2="32" y2="10" stroke={isActive ? 'var(--accent)' : 'var(--border-light)'} strokeWidth="2" />
                <polygon points="32,5 40,10 32,15" fill={isActive ? 'var(--accent)' : 'var(--border-light)'} />
              </svg>

              <motion.div
                className={`fs-cnn-node ${isActive ? 'fs-cnn-node--active' : ''} ${isHighlighted ? 'fs-cnn-node--highlighted' : ''}`}
                initial={false}
                animate={{
                  borderColor: isHighlighted ? 'var(--accent)' : isActive ? 'var(--accent)' : 'var(--border-light)',
                  boxShadow: isHighlighted ? '0 0 16px var(--accent-glow)' : '0 0 0px transparent',
                }}
                transition={{ duration: 0.4 }}
              >
                <span className="fs-cnn-node-title">{layer.label}</span>
                <span className="fs-cnn-node-count">{layer.filterCount} filters</span>
                {isActive && (
                  <motion.span
                    className="fs-cnn-node-desc"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {layer.description}
                  </motion.span>
                )}
              </motion.div>
            </div>
          );
        })}

        <div className="fs-cnn-layer-group">
          <svg className="fs-cnn-arrow" width="40" height="20" viewBox="0 0 40 20">
            <line x1="0" y1="10" x2="32" y2="10" stroke={visible && activeLayer >= layers.length - 1 ? 'var(--accent)' : 'var(--border-light)'} strokeWidth="2" />
            <polygon points="32,5 40,10 32,15" fill={visible && activeLayer >= layers.length - 1 ? 'var(--accent)' : 'var(--border-light)'} />
          </svg>
          <div className={`fs-cnn-node fs-cnn-node--output ${visible && activeLayer >= layers.length - 1 ? 'fs-cnn-node--active' : ''}`}>
            <div className="fs-cnn-node-icon">🏷️</div>
            <span className="fs-cnn-node-label">Output</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {buildStep === 1 && (
          <motion.p key="b1" className="fs-cnn-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Each layer slides learned kernels over its input — the same convolution we've been doing by hand
          </motion.p>
        )}
        {buildStep === 2 && (
          <motion.p key="b2" className="fs-cnn-caption" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Deeper layers combine simple edges into corners, textures, and repeated patterns
          </motion.p>
        )}
        {buildStep >= 3 && (
          <motion.p key="b3" className="fs-cnn-caption fs-cnn-caption--highlight" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Hundreds of layers, thousands of kernels — all learned automatically. But the core operation is still: slide, multiply, sum.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function imageDataToDataURL(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d').putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}

/**
 * All gallery grids are always in the DOM. Only the active one is visible.
 * This prevents any layout shift when switching layers.
 */
function GalleryGrids({ activeIndex, layers, filters, filterDataURLs }) {
  const computedCols = filters.length <= 4 ? 2 : 3;

  return (
    <div className="fs-grid-stack">
      {/* Layer 0: computed filters */}
      <motion.div
        className={`fs-filter-grid fs-grid-layer ${computedCols === 2 ? 'fs-filter-grid--cols-2' : ''}`}
        style={{ gridTemplateColumns: `repeat(${computedCols}, 1fr)` }}
        initial={false}
        animate={{ opacity: activeIndex === 0 ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      >
        {filters.map((filter, i) => (
          <div key={filter.name} className="fs-filter-item">
            {filterDataURLs[i] ? (
              <img src={filterDataURLs[i]} alt={filter.name} className="fs-gallery-img" />
            ) : (
              <div className="fs-gallery-placeholder" />
            )}
            <span className="fs-filter-name">{filter.name}</span>
          </div>
        ))}
      </motion.div>

      {/* Layers 1+: pre-generated images */}
      {layers.map((layer, li) => {
        if (li === 0 || !layer.images) return null;
        const cols = layer.images.length <= 4 ? 2 : 3;
        return (
          <motion.div
            key={li}
            className={`fs-filter-grid fs-grid-layer ${cols === 2 ? 'fs-filter-grid--cols-2' : ''}`}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            initial={false}
            animate={{ opacity: activeIndex === li ? 1 : 0 }}
            transition={{ duration: 0.35 }}
          >
            {layer.images.map((img) => (
              <div key={img.name} className="fs-filter-item">
                <img src={img.src} alt={img.name} className="fs-gallery-img" />
                <span className="fs-filter-name">{img.name}</span>
              </div>
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}

export default function FilterStackSlide({ slide, buildStep }) {
  const { title, imageSrc, filters = [], layers = [] } = slide;
  const [originalDataURL, setOriginalDataURL] = useState(null);
  const [filterDataURLs, setFilterDataURLs] = useState([]);

  const visibleStep = buildStep ?? 0;

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const origScale = ORIGINAL_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const origW = Math.round(img.naturalWidth * origScale);
      const origH = Math.round(img.naturalHeight * origScale);
      const origCanvas = document.createElement('canvas');
      origCanvas.width = origW;
      origCanvas.height = origH;
      origCanvas.getContext('2d').drawImage(img, 0, 0, origW, origH);
      setOriginalDataURL(origCanvas.toDataURL());

      const galScale = GALLERY_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const galW = Math.round(img.naturalWidth * galScale);
      const galH = Math.round(img.naturalHeight * galScale);
      const galCanvas = document.createElement('canvas');
      galCanvas.width = galW;
      galCanvas.height = galH;
      galCanvas.getContext('2d').drawImage(img, 0, 0, galW, galH);
      const sourceData = galCanvas.getContext('2d').getImageData(0, 0, galW, galH);

      const urls = filters.map(f => {
        const result = applyConvolution(sourceData, f.kernel);
        return imageDataToDataURL(result);
      });
      setFilterDataURLs(urls);
    };
    img.src = imageSrc;
  }, [imageSrc, filters]);

  const activeLayer = visibleStep <= 1 ? 0 : visibleStep === 2 ? 1 : layers.length - 1;

  return (
    <div className="slide--filter-stack">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {title}
      </motion.h2>

      <div className="fs-gallery-zone">
        <motion.div
          className="fs-original"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="fs-label">Original</span>
          {originalDataURL && <img src={originalDataURL} alt="Original" className="fs-canvas fs-canvas--original" />}
        </motion.div>

        <div className="fs-arrow-divider">
          <svg width="30" height="20" viewBox="0 0 30 20">
            <line x1="0" y1="10" x2="22" y2="10" stroke="var(--text-muted)" strokeWidth="2" />
            <polygon points="22,5 30,10 22,15" fill="var(--text-muted)" />
          </svg>
        </div>

        <GalleryGrids
          activeIndex={activeLayer}
          layers={layers}
          filters={filters}
          filterDataURLs={filterDataURLs}
        />
      </div>

      <CnnDiagram
        layers={layers}
        activeLayer={activeLayer}
        buildStep={visibleStep}
      />
    </div>
  );
}
