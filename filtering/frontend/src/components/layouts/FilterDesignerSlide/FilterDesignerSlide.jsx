import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './FilterDesignerSlide.css';

const DISPLAY_SIZE = 300;

function applyConvolution(imageData, kernel, normalize) {
  const { width, height, data } = imageData;
  const kSize = kernel.length;
  const pad = Math.floor(kSize / 2);

  const kernelSum = kernel.flat().reduce((a, b) => a + b, 0);
  const divisor = normalize && kernelSum !== 0 ? Math.abs(kernelSum) : 1;

  const output = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const sy = Math.min(height - 1, Math.max(0, y + ky - pad));
          const sx = Math.min(width - 1, Math.max(0, x + kx - pad));
          const idx = (sy * width + sx) * 4;
          const kVal = kernel[ky][kx];
          rSum += data[idx] * kVal;
          gSum += data[idx + 1] * kVal;
          bSum += data[idx + 2] * kVal;
        }
      }

      const oIdx = (y * width + x) * 4;
      output[oIdx] = Math.max(0, Math.min(255, Math.round(rSum / divisor)));
      output[oIdx + 1] = Math.max(0, Math.min(255, Math.round(gSum / divisor)));
      output[oIdx + 2] = Math.max(0, Math.min(255, Math.round(bSum / divisor)));
      output[oIdx + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

export default function FilterDesignerSlide({ slide }) {
  const { title, imageSrc, defaultKernel, presets = [] } = slide;

  const [kernel, setKernel] = useState(() =>
    defaultKernel ? defaultKernel.map(r => [...r]) : [[0,0,0],[0,1,0],[0,0,0]]
  );
  const [activePreset, setActivePreset] = useState(null);
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

    const result = applyConvolution(sourceImageData, kernel, true);
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
    setActivePreset(null);
  }, []);

  const applyPreset = useCallback((preset) => {
    setKernel(preset.kernel.map(r => [...r]));
    setActivePreset(preset.name);
  }, []);

  const kernelSum = kernel.flat().reduce((a, b) => a + b, 0);

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
            {presets.map((preset) => (
              <button
                key={preset.name}
                className={`preset-btn ${activePreset === preset.name ? 'preset-btn--active' : ''}`}
                onClick={() => applyPreset(preset)}
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

          <span className="kernel-sum-display">
            Kernel sum: {kernelSum}{kernelSum !== 0 ? ` (auto-normalized ÷ ${Math.abs(kernelSum)})` : ''}
          </span>
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
