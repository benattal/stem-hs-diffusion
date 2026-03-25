import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import './ConvolutionAnimationSlide.css';

const IMG_SIZE = 310; // display size for image canvases

function generatePixelGrid(size) {
  const grid = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      const base = Math.round((r * 20 + c * 25 + Math.sin(r * 0.8) * 30 + Math.cos(c * 0.6) * 20) % 256);
      row.push(Math.max(0, Math.min(255, base)));
    }
    grid.push(row);
  }
  return grid;
}

function drawToCanvas(canvas, imageSrc, maxSize) {
  return new Promise((resolve) => {
    if (!canvas || !imageSrc) return resolve();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = maxSize / Math.max(img.naturalWidth, img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve();
    };
    img.src = imageSrc;
  });
}

function applyBoxBlur(canvas, imageSrc, kernel, maxSize) {
  return new Promise((resolve) => {
    if (!canvas || !imageSrc) return resolve();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = maxSize / Math.max(img.naturalWidth, img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      const ctx = tmp.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const src = ctx.getImageData(0, 0, w, h);
      const kSize = kernel.length;
      const pad = Math.floor(kSize / 2);
      const kSum = kernel.flat().reduce((a, b) => a + b, 0) || 1;
      const out = new Uint8ClampedArray(src.data.length);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let rS = 0, gS = 0, bS = 0;
          for (let ky = 0; ky < kSize; ky++) {
            for (let kx = 0; kx < kSize; kx++) {
              const sy = Math.min(h - 1, Math.max(0, y + ky - pad));
              const sx = Math.min(w - 1, Math.max(0, x + kx - pad));
              const i = (sy * w + sx) * 4;
              const kv = kernel[ky][kx];
              rS += src.data[i] * kv; gS += src.data[i + 1] * kv; bS += src.data[i + 2] * kv;
            }
          }
          const oi = (y * w + x) * 4;
          out[oi] = Math.round(rS / kSum); out[oi + 1] = Math.round(gS / kSum);
          out[oi + 2] = Math.round(bS / kSum); out[oi + 3] = 255;
        }
      }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').putImageData(new ImageData(out, w, h), 0, 0);
      resolve();
    };
    img.src = imageSrc;
  });
}

export default function ConvolutionAnimationSlide({ slide, buildStep }) {
  const { title, imageSrc, kernel, kernelScale = 1, gridSize = 7 } = slide;
  const kSize = kernel.length;
  const pad = Math.floor(kSize / 2);

  const pixelGrid = useMemo(() => generatePixelGrid(gridSize), [gridSize]);

  const originalRef = useRef(null);
  const blurredRef = useRef(null);

  // Load images once
  useEffect(() => {
    drawToCanvas(originalRef.current, imageSrc, IMG_SIZE);
    applyBoxBlur(blurredRef.current, imageSrc, kernel, IMG_SIZE);
  }, [imageSrc, kernel]);

  // --- Filtering animation state (active in step 1) ---
  const maxRow = gridSize - kSize;
  const maxCol = gridSize - kSize;
  const totalPositions = (maxRow + 1) * (maxCol + 1);

  const [posIndex, setPosIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [outputGrid, setOutputGrid] = useState(() =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(null))
  );
  const intervalRef = useRef(null);

  const currentRow = Math.floor(posIndex / (maxCol + 1));
  const currentCol = posIndex % (maxCol + 1);

  const computation = useMemo(() => {
    const products = [];
    let sum = 0;
    for (let kr = 0; kr < kSize; kr++) {
      for (let kc = 0; kc < kSize; kc++) {
        const pixelVal = pixelGrid[currentRow + kr][currentCol + kc];
        const kernelVal = kernel[kr][kc];
        products.push({ pixelVal, kernelVal, product: pixelVal * kernelVal });
        sum += pixelVal * kernelVal;
      }
    }
    return { products, sum, result: Math.round(sum / kernelScale) };
  }, [currentRow, currentCol, pixelGrid, kernel, kSize, kernelScale]);

  useEffect(() => {
    const outRow = currentRow + pad;
    const outCol = currentCol + pad;
    setOutputGrid(prev => {
      const next = prev.map(r => [...r]);
      next[outRow][outCol] = computation.result;
      return next;
    });
  }, [posIndex, currentRow, currentCol, pad, computation.result]);

  const step = useCallback(() => {
    setPosIndex(prev => {
      if (prev >= totalPositions - 1) { setIsPlaying(false); return prev; }
      return prev + 1;
    });
  }, [totalPositions]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setPosIndex(0);
    setOutputGrid(Array.from({ length: gridSize }, () => Array(gridSize).fill(null)));
  }, [gridSize]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(step, 800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, step]);

  const cellSize = Math.min(44, Math.floor(IMG_SIZE / gridSize));
  const gridPx = gridSize * (cellSize + 1) + 1; // total pixel grid size

  // Build steps:
  // 0 = show original image
  // 1 = pixel grid fades in, image fades out
  // 2 = filtering demo (kernel sliding, computation)
  // 3 = blurred image fades over output grid

  return (
    <div className="slide--convolution-anim" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="conv-main"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Left: Input side — image with pixel grid overlay */}
        <div className="conv-slot">
          <span className="grid-section-label">
            {buildStep === 0 || buildStep === 3 ? 'Original Image' : 'Input Pixels'}
          </span>
          <div className="conv-stack" style={{ width: gridPx, height: gridPx }}>
            {/* Original image (visible at step 0 and step 3) */}
            <canvas
              ref={originalRef}
              className="conv-stack-layer"
              style={{ opacity: buildStep === 0 || buildStep >= 3 ? 1 : 0, transition: 'opacity 0.8s ease', objectFit: 'cover', width: gridPx, height: gridPx }}
            />
            {/* Pixel grid (visible at steps 1-2) */}
            <div
              className="conv-stack-layer"
              style={{ opacity: buildStep >= 1 && buildStep <= 2 ? 1 : 0, transition: 'opacity 0.8s ease' }}
            >
              <div
                className="pixel-grid"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                }}
              >
                {pixelGrid.flat().map((val, idx) => {
                  const r = Math.floor(idx / gridSize);
                  const c = idx % gridSize;
                  const inKernel = buildStep === 2 && r >= currentRow && r < currentRow + kSize &&
                                   c >= currentCol && c < currentCol + kSize;
                  const brightness = val / 255;
                  return (
                    <div
                      key={idx}
                      className={`pixel-cell ${inKernel ? 'pixel-cell--highlighted' : ''}`}
                      style={{
                        width: cellSize, height: cellSize,
                        background: `rgb(${val},${val},${val})`,
                        color: brightness > 0.5 ? '#000' : '#fff',
                      }}
                    >
                      {val}
                    </div>
                  );
                })}
                {buildStep === 2 && (
                  <div
                    className="kernel-overlay"
                    style={{
                      width: kSize * (cellSize + 1) - 1,
                      height: kSize * (cellSize + 1) - 1,
                      top: currentRow * (cellSize + 1),
                      left: currentCol * (cellSize + 1),
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Kernel (visible steps 2-3) + computation (step 2 only) */}
        <div className="conv-center" style={{ opacity: buildStep >= 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
          <div className="conv-kernel-display">
            <span className="grid-section-label">Kernel</span>
            <div className="kernel-display-grid" style={{ gridTemplateColumns: `repeat(${kSize}, 1fr)` }}>
              {kernel.flat().map((val, i) => (
                <span key={i} className="kernel-display-cell">{val}</span>
              ))}
            </div>
            <span className="kernel-display-note">÷ {kernelScale}</span>
          </div>

          <div className="computation-panel" style={{ opacity: buildStep === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <h4>Kernel × Pixels</h4>
            <div className="computation-grid" style={{ gridTemplateColumns: `repeat(${kSize}, 1fr)` }}>
              {computation.products.map((p, i) => (
                <div key={i} className="computation-cell">{p.kernelVal}×{p.pixelVal}</div>
              ))}
            </div>
            <h4>Sum ÷ {kernelScale}</h4>
            <div className="computation-result">= {computation.result}</div>
          </div>

          <div className="convolution-controls" style={{ opacity: buildStep === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <button onClick={() => setIsPlaying(p => !p)} className={isPlaying ? 'btn--playing' : ''}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={step} disabled={isPlaying || posIndex >= totalPositions - 1}>Step</button>
            <button onClick={reset}>Reset</button>
            <span className="convolution-progress">{posIndex + 1}/{totalPositions}</span>
          </div>
        </div>

        {/* Right: Output side — output grid with blurred image overlay */}
        <div className="conv-slot">
          <span className="grid-section-label">
            {buildStep <= 2 ? 'Output Pixels' : 'Filtered Image'}
          </span>
          <div className="conv-stack" style={{ width: gridPx, height: gridPx, opacity: buildStep >= 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            {/* Output pixel grid */}
            <div className="conv-stack-layer">
              <div
                className="pixel-grid"
                style={{
                  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
                  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
                }}
              >
                {outputGrid.flat().map((val, idx) => {
                  const r = Math.floor(idx / gridSize);
                  const c = idx % gridSize;
                  const isCurrent = buildStep === 2 && r === currentRow + pad && c === currentCol + pad;
                  const isEdge = r < pad || r >= gridSize - pad || c < pad || c >= gridSize - pad;
                  const bg = val !== null
                    ? `rgb(${Math.max(0, Math.min(255, val))},${Math.max(0, Math.min(255, val))},${Math.max(0, Math.min(255, val))})`
                    : isEdge ? 'var(--bg-card)' : 'var(--bg-elevated)';
                  const textColor = val !== null && val / 255 > 0.5 ? '#000' : '#fff';
                  return (
                    <div
                      key={idx}
                      className={`pixel-cell ${isCurrent ? 'pixel-cell--highlighted' : ''}`}
                      style={{
                        width: cellSize, height: cellSize,
                        background: bg,
                        color: val !== null ? textColor : 'var(--text-muted)',
                        opacity: isEdge && val === null ? 0.3 : 1,
                      }}
                    >
                      {val !== null ? val : isEdge ? '—' : ''}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Blurred image fades over at step 3 */}
            <canvas
              ref={blurredRef}
              className="conv-stack-layer"
              style={{ opacity: buildStep >= 3 ? 1 : 0, transition: 'opacity 0.8s ease', objectFit: 'cover', width: gridPx, height: gridPx }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
