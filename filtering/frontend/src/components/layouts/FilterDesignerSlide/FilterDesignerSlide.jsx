import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { applyConvolution } from '@app/utils/convolution.js';
import './FilterDesignerSlide.css';

const DISPLAY_SIZE = 300;

export default function FilterDesignerSlide({ slide }) {
  const { title, imageSrc, defaultKernel, presets = [] } = slide;

  const [kernel, setKernel] = useState(() =>
    defaultKernel ? defaultKernel.map(r => [...r]) : [[0,0,0],[0,1,0],[0,0,0]]
  );
  const [sourceImageData, setSourceImageData] = useState(null);

  const originalCanvasRef = useRef(null);
  const filteredCanvasRef = useRef(null);

  // Load and downscale image
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = DISPLAY_SIZE / Math.max(img.naturalWidth, img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      setSourceImageData(ctx.getImageData(0, 0, w, h));

      // Draw original
      if (originalCanvasRef.current) {
        originalCanvasRef.current.width = w;
        originalCanvasRef.current.height = h;
        originalCanvasRef.current.getContext('2d').drawImage(img, 0, 0, w, h);
      }
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Apply convolution when kernel or normalize changes
  useEffect(() => {
    if (!sourceImageData || !filteredCanvasRef.current) return;

    const result = applyConvolution(sourceImageData, kernel);
    filteredCanvasRef.current.width = result.width;
    filteredCanvasRef.current.height = result.height;
    filteredCanvasRef.current.getContext('2d').putImageData(result, 0, 0);
  }, [kernel, sourceImageData]);

  const handleKernelChange = useCallback((row, col, value) => {
    const num = parseFloat(value);
    setKernel(prev => {
      const next = prev.map(r => [...r]);
      next[row][col] = isNaN(num) ? 0 : num;
      return next;
    });
  }, []);

  const initialKernel = defaultKernel ? defaultKernel.map(r => [...r]) : [[0,0,0],[0,1,0],[0,0,0]];

  const handleReset = useCallback(() => {
    setKernel(initialKernel.map(r => [...r]));
  }, []);

  const handleRandom = useCallback(() => {
    setKernel(prev => prev.map(row => row.map(() => Math.floor(Math.random() * 5))));
  }, []);

  return (
    <div className="slide--filter-designer" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="filter-designer-layout"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Original image */}
        <div className="filter-designer-image">
          <span className="filter-designer-image-label">Original</span>
          <canvas ref={originalCanvasRef} />
        </div>

        {/* Kernel editor */}
        <div className="filter-designer-controls">
          <div className="preset-buttons">
            {presets.length === 0 && (
              <>
                <button className="preset-btn" onClick={handleReset}>Reset</button>
                <button className="preset-btn" onClick={handleRandom}>Random</button>
              </>
            )}
            {presets.map((preset) => (
              <button
                key={preset.name}
                className="preset-btn"
                onClick={() => setKernel(preset.kernel.map(r => [...r]))}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="kernel-grid" style={{ gridTemplateColumns: `repeat(${kernel[0]?.length || 3}, 1fr)` }}>
            {kernel.map((row, ri) =>
              row.map((val, ci) => (
                <input
                  key={`${ri}-${ci}`}
                  type="number"
                  className="kernel-input"
                  value={val}
                  onChange={(e) => handleKernelChange(ri, ci, e.target.value)}
                  step="1"
                />
              ))
            )}
          </div>

        </div>

        {/* Filtered image */}
        <div className="filter-designer-image">
          <span className="filter-designer-image-label">Filtered</span>
          <canvas ref={filteredCanvasRef} />
        </div>
      </motion.div>
    </div>
  );
}
