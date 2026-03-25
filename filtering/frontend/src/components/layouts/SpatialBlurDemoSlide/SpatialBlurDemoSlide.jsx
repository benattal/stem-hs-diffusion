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

// Cardinal directions: center, then N, E, S, W, then diagonals NE, SE, SW, NW
const DIRECTIONS = [
  { dx: 0, dy: 0, label: 'Center', color: '#6c9fff' },
  { dx: 0, dy: -1, label: 'N', color: '#ff6b6b' },
  { dx: 1, dy: 0, label: 'E', color: '#51cf66' },
  { dx: 0, dy: 1, label: 'S', color: '#ffd43b' },
  { dx: -1, dy: 0, label: 'W', color: '#cc5de8' },
  { dx: 1, dy: -1, label: 'NE', color: '#ff922b' },
  { dx: 1, dy: 1, label: 'SE', color: '#20c997' },
  { dx: -1, dy: 1, label: 'SW', color: '#66d9e8' },
  { dx: -1, dy: -1, label: 'NW', color: '#e599f7' },
];

// Find a pixel at a color boundary (high gradient with neighbors)
function findBoundaryPixel(imageData) {
  const { width, height, data } = imageData;
  const margin = 3; // enough room for 5x5 grid around the pixel
  let bestX = Math.floor(width / 2);
  let bestY = Math.floor(height / 2);
  let bestScore = 0;

  for (let y = margin; y < height - margin; y++) {
    for (let x = margin; x < width - margin; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      let score = 0;
      const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      for (const [ox, oy] of offsets) {
        const nIdx = ((y + oy) * width + (x + ox)) * 4;
        const dr = r - data[nIdx];
        const dg = g - data[nIdx + 1];
        const db = b - data[nIdx + 2];
        score += Math.sqrt(dr * dr + dg * dg + db * db);
      }

      if (score > bestScore) {
        bestScore = score;
        bestX = x;
        bestY = y;
      }
    }
  }

  return { x: bestX, y: bestY };
}

// Shared grid layout computation
function getGridLayout(width, height, cx, cy) {
  const gridCount = 5;
  const halfGrid = Math.floor(gridCount / 2);
  const cellSize = Math.min(
    Math.floor((width - 40) / gridCount),
    Math.floor((height - 80) / gridCount)
  );
  const gridW = gridCount * cellSize;
  const gridH = gridCount * cellSize;
  const gridX = Math.floor((width - gridW) / 2);
  const gridY = 8;
  return { cx, cy, gridCount, halfGrid, cellSize, gridW, gridH, gridX, gridY };
}

// Draw the zoomed pixel grid with colored cells and grid lines
function drawPixelGrid(ctx, imageData, layout) {
  const { width, data } = imageData;
  const { cx, cy, gridCount, halfGrid, cellSize, gridW, gridH, gridX, gridY } = layout;

  for (let gy = 0; gy < gridCount; gy++) {
    for (let gx = 0; gx < gridCount; gx++) {
      const px = cx - halfGrid + gx;
      const py = cy - halfGrid + gy;

      if (px >= 0 && px < width && py >= 0 && py < imageData.height) {
        const idx = (py * width + px) * 4;
        ctx.fillStyle = `rgb(${data[idx]},${data[idx + 1]},${data[idx + 2]})`;
      } else {
        ctx.fillStyle = '#333';
      }

      const cellX = gridX + gx * cellSize;
      const cellY = gridY + gy * cellSize;
      ctx.fillRect(cellX, cellY, cellSize, cellSize);
    }
  }

  // Grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    ctx.beginPath();
    ctx.moveTo(gridX + i * cellSize, gridY);
    ctx.lineTo(gridX + i * cellSize, gridY + gridH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cellSize);
    ctx.lineTo(gridX + gridW, gridY + i * cellSize);
    ctx.stroke();
  }
}

// Step 3: Zoomed grid with center pixel highlighted
function drawZoomedCenter(canvas, imageData, px, py) {
  if (!canvas || !imageData) return;
  const { width, height } = imageData;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const layout = getGridLayout(width, height, px, py);
  const { halfGrid, cellSize, gridX, gridY } = layout;

  // Dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  // Draw full pixel grid
  drawPixelGrid(ctx, imageData, layout);

  // Highlight center pixel
  const centerCellX = gridX + halfGrid * cellSize;
  const centerCellY = gridY + halfGrid * cellSize;
  ctx.strokeStyle = '#6c9fff';
  ctx.lineWidth = 3;
  ctx.strokeRect(centerCellX, centerCellY, cellSize, cellSize);

  // Label
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.max(11, Math.floor(cellSize / 3.5))}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('This pixel', width / 2, gridY + layout.gridH + 12);
}

// Step 4: Animated directional contribution
function drawDirectionalContribution(canvas, imageData, dirStep, px, py) {
  if (!canvas || !imageData) return;
  const { width, height, data } = imageData;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const layout = getGridLayout(width, height, px, py);
  const { cx, cy, gridCount, halfGrid, cellSize, gridW, gridH, gridX, gridY } = layout;

  // Dark background
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height);

  // Draw full pixel grid
  drawPixelGrid(ctx, imageData, layout);

  // Dim non-contributing pixels
  for (let gy = 0; gy < gridCount; gy++) {
    for (let gx = 0; gx < gridCount; gx++) {
      const relX = gx - halfGrid;
      const relY = gy - halfGrid;
      const isContributing = DIRECTIONS.some(
        (d, i) => i <= dirStep && d.dx === relX && d.dy === relY
      );
      if (!isContributing) {
        const cellX = gridX + gx * cellSize;
        const cellY = gridY + gy * cellSize;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(cellX, cellY, cellSize, cellSize);
      }
    }
  }

  // Re-draw grid lines on top of dimming
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridCount; i++) {
    ctx.beginPath();
    ctx.moveTo(gridX + i * cellSize, gridY);
    ctx.lineTo(gridX + i * cellSize, gridY + gridH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gridX, gridY + i * cellSize);
    ctx.lineTo(gridX + gridW, gridY + i * cellSize);
    ctx.stroke();
  }

  // Center cell position
  const centerCellX = gridX + halfGrid * cellSize + cellSize / 2;
  const centerCellY = gridY + halfGrid * cellSize + cellSize / 2;

  // Highlight contributing pixels and draw arrows
  let rSum = 0, gSum = 0, bSum = 0, count = 0;

  for (let i = 0; i <= dirStep && i < DIRECTIONS.length; i++) {
    const dir = DIRECTIONS[i];
    const gx = halfGrid + dir.dx;
    const gy = halfGrid + dir.dy;
    const cellX = gridX + gx * cellSize;
    const cellY = gridY + gy * cellSize;

    // Colored border
    ctx.strokeStyle = dir.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(cellX, cellY, cellSize, cellSize);

    // Accumulate for average
    const px = cx + dir.dx;
    const py = cy + dir.dy;
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const idx = (py * width + px) * 4;
      rSum += data[idx]; gSum += data[idx + 1]; bSum += data[idx + 2];
      count++;
    }

    // Draw arrow from neighbor toward center
    if (i > 0) {
      const fromX = cellX + cellSize / 2;
      const fromY = cellY + cellSize / 2;

      const angle = Math.atan2(centerCellY - fromY, centerCellX - fromX);
      const dist = Math.hypot(centerCellX - fromX, centerCellY - fromY);
      const inset = cellSize * 0.35;
      const ax = fromX + Math.cos(angle) * inset;
      const ay = fromY + Math.sin(angle) * inset;
      const bx2 = fromX + Math.cos(angle) * (dist - inset);
      const by2 = fromY + Math.sin(angle) * (dist - inset);

      ctx.strokeStyle = dir.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx2, by2);
      ctx.stroke();

      // Arrowhead
      const headLen = 8;
      ctx.beginPath();
      ctx.moveTo(
        bx2 - headLen * Math.cos(angle - Math.PI / 6),
        by2 - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(bx2, by2);
      ctx.lineTo(
        bx2 - headLen * Math.cos(angle + Math.PI / 6),
        by2 - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    // Direction label inside cell
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(10, Math.floor(cellSize / 4))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(dir.label, cellX + cellSize / 2, cellY + 3);
  }

  // Draw result area below the grid
  const resultSize = Math.min(cellSize, 36);
  const resultY = gridY + gridH + 10;
  const resultX = Math.floor(width / 2 - resultSize / 2);

  // Down-arrow from grid to result
  ctx.strokeStyle = '#6c9fff';
  ctx.lineWidth = 2;
  const arrowTopY = gridY + gridH + 2;
  const arrowBotY = resultY - 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, arrowTopY);
  ctx.lineTo(width / 2, arrowBotY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width / 2 - 5, arrowBotY - 5);
  ctx.lineTo(width / 2, arrowBotY);
  ctx.lineTo(width / 2 + 5, arrowBotY - 5);
  ctx.stroke();

  // Result color block
  const avgR = count > 0 ? Math.round(rSum / count) : 0;
  const avgG = count > 0 ? Math.round(gSum / count) : 0;
  const avgB = count > 0 ? Math.round(bSum / count) : 0;

  ctx.fillStyle = `rgb(${avgR},${avgG},${avgB})`;
  ctx.fillRect(resultX, resultY, resultSize, resultSize);
  ctx.strokeStyle = '#6c9fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(resultX, resultY, resultSize, resultSize);

  // Label to the right of result block
  ctx.fillStyle = '#ccc';
  ctx.font = `bold ${Math.max(11, Math.floor(cellSize / 3.5))}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    count >= DIRECTIONS.length ? 'Average (3×3)' : `Average of ${count} pixel${count > 1 ? 's' : ''}`,
    resultX + resultSize + 8,
    resultY + resultSize / 2
  );
}

export default function SpatialBlurDemoSlide({ slide, buildStep }) {
  const { title, imageSrc, blockSizes = [1, 2, 4, 8, 16] } = slide;
  const { imageData, dims } = useImageData(imageSrc);

  const originalRef = useRef(null);
  const blur1Ref = useRef(null);
  const blur2Ref = useRef(null);

  const smallBlock = blockSizes[2] || 4;
  const largeBlock = blockSizes[3] || 8;

  // Find a boundary pixel once when image loads
  const boundaryRef = useRef(null);
  if (imageData && !boundaryRef.current) {
    boundaryRef.current = findBoundaryPixel(imageData);
  }

  // Direction animation state for pixel contribution step (buildStep 4)
  const [dirStep, setDirStep] = useState(-1);
  const dirTimerRef = useRef(null);
  const dirStartedRef = useRef(false);

  // Reset animation when navigating away from step 4
  useEffect(() => {
    if (buildStep < 4) {
      dirStartedRef.current = false;
      setDirStep(-1);
      if (dirTimerRef.current) {
        clearInterval(dirTimerRef.current);
        dirTimerRef.current = null;
      }
    }
  }, [buildStep]);

  // Start animation when reaching step 4
  useEffect(() => {
    if (buildStep >= 4 && imageData && !dirStartedRef.current) {
      dirStartedRef.current = true;
      let step = 0;
      setDirStep(0);

      dirTimerRef.current = setInterval(() => {
        step++;
        if (step >= DIRECTIONS.length) {
          clearInterval(dirTimerRef.current);
          dirTimerRef.current = null;
          return;
        }
        setDirStep(step);
      }, 800);
    }

    return () => {
      if (dirTimerRef.current) {
        clearInterval(dirTimerRef.current);
        dirTimerRef.current = null;
      }
    };
  }, [buildStep, imageData]);

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

  // Draw large-block, zoomed center, or directional contribution (step 2+)
  useEffect(() => {
    if (imageData && blur2Ref.current && dims && boundaryRef.current) {
      const { x: bpx, y: bpy } = boundaryRef.current;
      if (buildStep === 2) {
        drawSuperpixels(blur2Ref.current, imageData, largeBlock);
      } else if (buildStep === 3) {
        drawZoomedCenter(blur2Ref.current, imageData, bpx, bpy);
      } else if (buildStep >= 4 && dirStep >= 0) {
        drawDirectionalContribution(blur2Ref.current, imageData, dirStep, bpx, bpy);
      }
    }
  }, [imageData, dims, buildStep, largeBlock, dirStep]);

  const canvasH = dims ? dims.height : Math.round(DISPLAY_WIDTH * 0.67);

  const descriptions = [
    '',
    '',
    '',
    '',
    '',
  ];

  const slotLabel = buildStep >= 4
    ? 'Pixel Contribution'
    : buildStep === 3
      ? 'Zoomed In'
      : buildStep >= 2
        ? `${largeBlock}×${largeBlock} Averaging`
        : '\u00A0';

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

        {/* Slot 3: large-block, zoomed center, or contribution (visible from step 2+) */}
        <div className="spatial-slot">
          <span className="spatial-slot-label">{slotLabel}</span>
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
