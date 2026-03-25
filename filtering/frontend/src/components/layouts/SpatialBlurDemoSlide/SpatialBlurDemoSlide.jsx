import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './SpatialBlurDemoSlide.css';

const DISPLAY_WIDTH = 350;

function useImageData(src) {
  const [imageData, setImageData] = useState(null);
  const [dims, setDims] = useState(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current || !src) return;
    loadedRef.current = true;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = DISPLAY_WIDTH / img.naturalWidth;
      const w = DISPLAY_WIDTH;
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      setImageData(ctx.getImageData(0, 0, w, h));
      setDims({ width: w, height: h });
    };
    img.src = src;
  }, [src]);

  return { imageData, dims };
}

function drawOriginal(canvas, imageData) {
  if (!canvas || !imageData) return;
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  canvas.getContext('2d').putImageData(imageData, 0, 0);
}

function drawSuperpixels(canvas, imageData, blockSize) {
  if (!canvas || !imageData) return;
  const { width, height, data } = imageData;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  for (let by = 0; by < height; by += blockSize) {
    for (let bx = 0; bx < width; bx += blockSize) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      const bw = Math.min(blockSize, width - bx);
      const bh = Math.min(blockSize, height - by);
      for (let dy = 0; dy < bh; dy++) {
        for (let dx = 0; dx < bw; dx++) {
          const idx = ((by + dy) * width + (bx + dx)) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }
      ctx.fillStyle = `rgb(${Math.round(rSum / count)},${Math.round(gSum / count)},${Math.round(bSum / count)})`;
      ctx.fillRect(bx, by, bw, bh);
    }
  }

  if (blockSize >= 4) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += blockSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y <= height; y += blockSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }
}

function drawContribution(canvas, imageData, blockSize, highlightBX, highlightBY) {
  if (!canvas || !imageData) return;
  const { width, height, data } = imageData;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Draw superpixelated then dim
  drawSuperpixels(canvas, imageData, blockSize);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, width, height);

  const bx = highlightBX * blockSize;
  const by = highlightBY * blockSize;
  const bw = Math.min(blockSize, width - bx);
  const bh = Math.min(blockSize, height - by);

  // Draw original pixels in the highlighted block
  for (let dy = 0; dy < bh; dy++) {
    for (let dx = 0; dx < bw; dx++) {
      const idx = ((by + dy) * width + (bx + dx)) * 4;
      ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
      ctx.fillRect(bx + dx, by + dy, 1, 1);
    }
  }

  // Grid within the block
  ctx.strokeStyle = 'rgba(255, 200, 50, 0.6)';
  ctx.lineWidth = 1;
  for (let x = bx; x <= bx + bw; x++) {
    ctx.beginPath(); ctx.moveTo(x, by); ctx.lineTo(x, by + bh); ctx.stroke();
  }
  for (let y = by; y <= by + bh; y++) {
    ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + bw, y); ctx.stroke();
  }

  // Highlight border
  ctx.strokeStyle = '#6c9fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);

  // Compute average color
  let rSum = 0, gSum = 0, bSum2 = 0;
  for (let dy = 0; dy < bh; dy++) {
    for (let dx = 0; dx < bw; dx++) {
      const idx = ((by + dy) * width + (bx + dx)) * 4;
      rSum += data[idx]; gSum += data[idx + 1]; bSum2 += data[idx + 2];
    }
  }
  const n = bw * bh;
  const avgR = Math.round(rSum / n), avgG = Math.round(gSum / n), avgB = Math.round(bSum2 / n);

  // Draw arrow + result block to the right
  const arrowStart = bx + bw + 4;
  const arrowEnd = arrowStart + 30;
  const midY = by + bh / 2;
  if (arrowEnd + bw + 4 < width) {
    ctx.strokeStyle = '#6c9fff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(arrowStart, midY); ctx.lineTo(arrowEnd - 4, midY); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(arrowEnd - 8, midY - 5); ctx.lineTo(arrowEnd - 2, midY); ctx.lineTo(arrowEnd - 8, midY + 5);
    ctx.stroke();

    ctx.fillStyle = `rgb(${avgR},${avgG},${avgB})`;
    ctx.fillRect(arrowEnd, by, bw, bh);
    ctx.strokeStyle = '#6c9fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(arrowEnd, by, bw, bh);

    // Label
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('avg', arrowEnd + bw / 2, by + bh + 14);
  }
}

export default function SpatialBlurDemoSlide({ slide, buildStep }) {
  const { title, imageSrc, blockSizes = [1, 2, 4, 8, 16] } = slide;
  const { imageData, dims } = useImageData(imageSrc);

  const originalRef = useRef(null);
  const blur1Ref = useRef(null);
  const blur2Ref = useRef(null);

  const smallBlock = blockSizes[2] || 4;
  const largeBlock = blockSizes[3] || 8;

  // Draw original (always)
  useEffect(() => {
    if (imageData && originalRef.current) drawOriginal(originalRef.current, imageData);
  }, [imageData]);

  // Draw small-block superpixels (step 1+)
  useEffect(() => {
    if (imageData && blur1Ref.current) {
      if (buildStep >= 1) {
        drawSuperpixels(blur1Ref.current, imageData, smallBlock);
      }
    }
  }, [imageData, buildStep, smallBlock]);

  // Draw large-block or contribution (step 2+)
  useEffect(() => {
    if (imageData && blur2Ref.current && dims) {
      if (buildStep === 2) {
        drawSuperpixels(blur2Ref.current, imageData, largeBlock);
      } else if (buildStep >= 3) {
        const hbx = Math.floor(dims.width / largeBlock / 2);
        const hby = Math.floor(dims.height / largeBlock / 2);
        drawContribution(blur2Ref.current, imageData, largeBlock, hbx, hby);
      }
    }
  }, [imageData, dims, buildStep, largeBlock]);

  const canvasH = dims ? dims.height : Math.round(DISPLAY_WIDTH * 0.67);

  const descriptions = [
    'Original image — every pixel is sharp',
    `${smallBlock}×${smallBlock} superpixel averaging`,
    `${largeBlock}×${largeBlock} superpixel averaging — more blur`,
    'Each output "superpixel" = average of the pixels inside it',
  ];

  return (
    <div className="slide--spatial-blur">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="spatial-blur-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Slot 1: always original */}
        <div className="spatial-slot">
          <span className="spatial-slot-label">Original</span>
          <div className="spatial-canvas-box" style={{ width: DISPLAY_WIDTH, height: canvasH }}>
            <canvas ref={originalRef} />
          </div>
        </div>

        {/* Slot 2: small-block superpixels (visible from step 1+) */}
        <div className="spatial-slot">
          <span className="spatial-slot-label">
            {buildStep >= 1 ? `${smallBlock}×${smallBlock} Averaging` : '\u00A0'}
          </span>
          <div className="spatial-canvas-box" style={{ width: DISPLAY_WIDTH, height: canvasH, opacity: buildStep >= 1 ? 1 : 0 }}>
            <canvas ref={blur1Ref} />
          </div>
        </div>

        {/* Slot 3: large-block or contribution (visible from step 2+) */}
        <div className="spatial-slot">
          <span className="spatial-slot-label">
            {buildStep >= 3 ? 'Pixel Contribution' : buildStep >= 2 ? `${largeBlock}×${largeBlock} Averaging` : '\u00A0'}
          </span>
          <div className="spatial-canvas-box" style={{ width: DISPLAY_WIDTH, height: canvasH, opacity: buildStep >= 2 ? 1 : 0 }}>
            <canvas ref={blur2Ref} />
          </div>
        </div>
      </motion.div>

      <div className="spatial-description-bar">
        <motion.p
          key={buildStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {descriptions[buildStep] || ''}
        </motion.p>
      </div>

      <div className="spatial-insight" style={{ opacity: buildStep >= 1 ? 1 : 0 }}>
        Spatial blur = averaging groups of neighboring pixels!
      </div>
    </div>
  );
}
