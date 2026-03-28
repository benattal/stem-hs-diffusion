import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PixelZoomSlide.css';

const CELL_SIZE = 52;
const CHANNEL_CELL = 36;
const GRID_GAP = 2;

const ZOOM_LEVELS = [1, 2, 4, 8, 16, 32, 64];

function toGrayscale(r, g, b) {
  return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
}

export default function PixelZoomSlide({ slide, buildStep }) {
  const {
    title,
    imageSrc,
    patchX: patchXProp,
    patchY: patchYProp,
    patchSize: patchSizeProp,
  } = slide;

  const patchSize = patchSizeProp || 9;
  const canvasRef = useRef(null);
  const [pixels, setPixels] = useState(null);
  const [imgNatural, setImgNatural] = useState(null);

  const patchX = patchXProp ?? (imgNatural ? Math.floor(imgNatural.width / 2) : null);
  const patchY = patchYProp ?? (imgNatural ? Math.floor(imgNatural.height / 2) : null);

  // Load image and extract pixel data
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgNatural({ width: img.naturalWidth, height: img.naturalHeight });

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const cx = patchXProp ?? Math.floor(img.naturalWidth / 2);
      const cy = patchYProp ?? Math.floor(img.naturalHeight / 2);
      const half = Math.floor(patchSize / 2);
      const startX = Math.max(0, Math.min(cx - half, img.naturalWidth - patchSize));
      const startY = Math.max(0, Math.min(cy - half, img.naturalHeight - patchSize));

      const imageData = ctx.getImageData(startX, startY, patchSize, patchSize);
      const data = imageData.data;
      const grid = [];
      for (let row = 0; row < patchSize; row++) {
        const rowArr = [];
        for (let col = 0; col < patchSize; col++) {
          const i = (row * patchSize + col) * 4;
          rowArr.push({ r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] });
        }
        grid.push(rowArr);
      }
      setPixels(grid);
    };
    img.src = imageSrc;
  }, [imageSrc, patchXProp, patchYProp, patchSize]);

  // Build step mapping:
  // 0-6: zoom levels (1x, 2x, 4x, 8x, 16x, 32x, 64x)
  // 7: pixel grid (colored cells)
  // 8: grayscale intensity overlay
  // 9: RGB channel split (animated from grayscale)
  const zoomStepCount = ZOOM_LEVELS.length; // 7
  const isZoomStep = buildStep < zoomStepCount;
  const isPixelGrid = buildStep === zoomStepCount; // 7
  const isGrayscale = buildStep === zoomStepCount + 1; // 8
  const isRGBSplit = buildStep >= zoomStepCount + 2; // 9

  const zoomConfig = useMemo(() => {
    if (!imgNatural || patchX == null || patchY == null) return { scale: 1, originX: '50%', originY: '50%' };
    const originX = `${(patchX / imgNatural.width) * 100}%`;
    const originY = `${(patchY / imgNatural.height) * 100}%`;
    if (!isZoomStep) return { scale: ZOOM_LEVELS[zoomStepCount - 1], originX, originY };
    const scale = ZOOM_LEVELS[buildStep];
    if (buildStep === 0) return { scale, originX: '50%', originY: '50%' };
    return { scale, originX, originY };
  }, [buildStep, isZoomStep, imgNatural, patchX, patchY, zoomStepCount]);

  const showFullImage = isZoomStep;
  const showPixelGrid = isPixelGrid || isGrayscale;
  const showRGBSplit = isRGBSplit;

  return (
    <div className="slide--pixel-zoom">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <motion.h2
        className="pixel-zoom__title"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="pixel-zoom__body">
        <AnimatePresence mode="wait">
          {/* Zoom steps */}
          {showFullImage && (
            <motion.div
              key="image-view"
              className="pixel-zoom__image-wrapper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="pixel-zoom__image-clip">
                <img
                  src={imageSrc}
                  alt={title}
                  className="pixel-zoom__image"
                  style={{
                    transform: `scale(${zoomConfig.scale})`,
                    transformOrigin: `${zoomConfig.originX} ${zoomConfig.originY}`,
                  }}
                />
              </div>
              <div className="pixel-zoom__zoom-label">
                {ZOOM_LEVELS[buildStep]}x Zoom
              </div>
            </motion.div>
          )}

          {/* Pixel grid with optional grayscale overlay */}
          {showPixelGrid && pixels && (
            <motion.div
              key="pixel-grid"
              className="pixel-zoom__grid-container"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              {isGrayscale && (
                <motion.div
                  className="pixel-zoom__grid-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Grayscale Intensity Values
                </motion.div>
              )}
              <div
                className="pixel-zoom__grid"
                style={{
                  gridTemplateColumns: `repeat(${patchSize}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${patchSize}, ${CELL_SIZE}px)`,
                  gap: `${GRID_GAP}px`,
                }}
              >
                {pixels.flat().map((px, i) => {
                  const intensity = toGrayscale(px.r, px.g, px.b);
                  return (
                    <motion.div
                      key={i}
                      layoutId={`pixel-${i}`}
                      className="pixel-zoom__cell"
                      style={{
                        backgroundColor: isGrayscale
                          ? `rgb(${intensity}, ${intensity}, ${intensity})`
                          : `rgb(${px.r}, ${px.g}, ${px.b})`,
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.004, duration: 0.25 }}
                    >
                      {isGrayscale && (
                        <motion.span
                          className="pixel-zoom__cell-value"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 + i * 0.003 }}
                        >
                          {intensity}
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RGB channel split - animated from grayscale */}
          {showRGBSplit && pixels && (
            <motion.div
              key="rgb-split"
              className="pixel-zoom__rgb-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {['Red', 'Green', 'Blue'].map((channel, ci) => (
                <motion.div
                  key={channel}
                  className="pixel-zoom__channel"
                  initial={{ x: 0, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: ci * 0.15 }}
                >
                  <motion.div
                    className={`pixel-zoom__channel-label pixel-zoom__channel-label--${channel.toLowerCase()}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + ci * 0.15 }}
                  >
                    {channel} Channel
                  </motion.div>
                  <div
                    className="pixel-zoom__channel-grid"
                    style={{
                      gridTemplateColumns: `repeat(${patchSize}, ${CHANNEL_CELL}px)`,
                      gridTemplateRows: `repeat(${patchSize}, ${CHANNEL_CELL}px)`,
                      gap: `${GRID_GAP}px`,
                    }}
                  >
                    {pixels.flat().map((px, i) => {
                      const val = ci === 0 ? px.r : ci === 1 ? px.g : px.b;
                      const bg =
                        ci === 0
                          ? `rgb(${px.r}, 0, 0)`
                          : ci === 1
                            ? `rgb(0, ${px.g}, 0)`
                            : `rgb(0, 0, ${px.b})`;
                      return (
                        <motion.div
                          key={i}
                          className="pixel-zoom__cell pixel-zoom__cell--channel"
                          style={{ backgroundColor: bg }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 + ci * 0.15 + i * 0.002 }}
                        >
                          <span className="pixel-zoom__cell-value">{val}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
