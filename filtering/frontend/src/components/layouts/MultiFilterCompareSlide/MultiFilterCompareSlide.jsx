import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applyConvolution, applyConvolutionRaw, combineEdgeMagnitude } from '@app/utils/convolution.js';
import './MultiFilterCompareSlide.css';

const CANVAS_SIZE = 220;

function KernelMatrix({ kernel }) {
  const size = kernel.length;
  return (
    <div className="mfc-kernel-grid" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {kernel.flat().map((val, i) => (
        <span key={i} className="mfc-kernel-cell" style={{ opacity: val === 0 ? 0.3 : 1 }}>
          {val}
        </span>
      ))}
    </div>
  );
}

export default function MultiFilterCompareSlide({ slide, buildStep }) {
  const { title, imageSrc, filters = [], combinedDescription, summary } = slide;
  const [sourceImageData, setSourceImageData] = useState(null);
  const [filterResults, setFilterResults] = useState([]);
  const [combinedResult, setCombinedResult] = useState(null);
  const originalCanvasRef = useRef(null);
  const filterCanvasRefs = useRef([]);
  const combinedCanvasRef = useRef(null);

  // Load source image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = CANVAS_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      setSourceImageData(imgData);

      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = w;
        originalCanvasRef.current.height = h;
        originalCanvasRef.current.getContext('2d').drawImage(img, 0, 0, w, h);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Compute filter results
  useEffect(() => {
    if (!sourceImageData || filters.length === 0) return;

    const results = filters.map(f => applyConvolution(sourceImageData, f.kernel));
    setFilterResults(results);

    // Compute combined edge magnitude if we have at least 2 filters
    if (filters.length >= 2) {
      const rawX = applyConvolutionRaw(sourceImageData, filters[0].kernel);
      const rawY = applyConvolutionRaw(sourceImageData, filters[1].kernel);
      const combined = combineEdgeMagnitude(rawX.raw, rawY.raw, rawX.width, rawX.height);
      setCombinedResult(combined);
    }
  }, [sourceImageData, filters]);

  // Paint filter results to canvases
  useEffect(() => {
    filterResults.forEach((result, i) => {
      const canvas = filterCanvasRefs.current[i];
      if (canvas && result) {
        canvas.width = result.width;
        canvas.height = result.height;
        canvas.getContext('2d').putImageData(result, 0, 0);
      }
    });
  }, [filterResults]);

  // Paint combined result
  useEffect(() => {
    if (combinedCanvasRef.current && combinedResult) {
      combinedCanvasRef.current.width = combinedResult.width;
      combinedCanvasRef.current.height = combinedResult.height;
      combinedCanvasRef.current.getContext('2d').putImageData(combinedResult, 0, 0);
    }
  }, [combinedResult]);

  const visibleStep = buildStep ?? 0;
  // Total columns: original + filters + combined
  const totalCols = 1 + filters.length + 1;

  return (
    <div className="slide--multi-filter-compare">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {title}
      </motion.h2>

      <div className="mfc-grid" style={{ gridTemplateColumns: `repeat(${totalCols}, 1fr)` }}>
        {/* Original — always visible */}
        <motion.div
          className="mfc-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className="mfc-label">Original</span>
          <canvas ref={originalCanvasRef} className="mfc-canvas" />
        </motion.div>

        {/* Filter outputs — always in DOM, fade in per build step */}
        {filters.map((filter, i) => {
          const visible = visibleStep >= i + 1;
          return (
            <motion.div
              key={filter.name}
              className="mfc-panel"
              initial={false}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="mfc-label">{filter.name}</span>
              <canvas
                ref={el => filterCanvasRefs.current[i] = el}
                className="mfc-canvas"
              />
              <KernelMatrix kernel={filter.kernel} />
              {filter.description && (
                <p className="mfc-description">{filter.description}</p>
              )}
            </motion.div>
          );
        })}

        {/* Combined — always in DOM, fade in on last step */}
        <motion.div
          className="mfc-panel mfc-panel--combined"
          initial={false}
          animate={{ opacity: visibleStep >= filters.length + 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="mfc-label mfc-label--accent">Combined</span>
          <canvas ref={combinedCanvasRef} className="mfc-canvas" />
          {combinedDescription && (
            <p className="mfc-description">{combinedDescription}</p>
          )}
        </motion.div>
      </div>

      {/* Summary text on final step */}
      <AnimatePresence>
        {visibleStep >= filters.length + 1 && summary && (
          <motion.p
            className="mfc-summary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {summary}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
