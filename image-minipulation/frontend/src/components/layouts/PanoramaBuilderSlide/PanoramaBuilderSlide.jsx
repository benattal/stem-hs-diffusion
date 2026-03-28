import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PanoramaBuilderSlide.css';

export default function PanoramaBuilderSlide({ slide, buildStep }) {
  const images = slide.images || [];
  const targetOrder = slide.targetOrder || images.map((_, i) => i);
  const overlapPercent = slide.overlapPercent ?? 30;
  const slotCount = images.length;

  // Shuffled source order (stable per slide)
  const shuffledIndices = useMemo(() => {
    const arr = images.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [images.length]);

  // slots[slotIndex] = imageIndex | null
  const [slots, setSlots] = useState(() => Array(slotCount).fill(null));
  const [complete, setComplete] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const placedIndices = new Set(slots.filter((v) => v !== null));

  const isCorrect = useCallback(
    (slotIdx, imgIdx) => targetOrder[slotIdx] === imgIdx,
    [targetOrder]
  );

  const checkComplete = useCallback(
    (newSlots) => {
      if (newSlots.every((v, i) => v !== null && targetOrder[i] === v)) {
        setTimeout(() => setComplete(true), 300);
      }
    },
    [targetOrder]
  );

  const handleDragStart = useCallback((e, imgIndex) => {
    e.stopPropagation();
    setDragIndex(imgIndex);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e, slotIdx) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragIndex === null) return;

      setSlots((prev) => {
        const next = [...prev];
        // If this slot already has an image, swap back to source
        // If dragged image was in another slot, clear that slot
        const existingSlot = next.indexOf(dragIndex);
        if (existingSlot !== -1) next[existingSlot] = null;

        // If target slot occupied, put that image back to source
        next[slotIdx] = dragIndex;
        checkComplete(next);
        return next;
      });
      setDragIndex(null);
    },
    [dragIndex, checkComplete]
  );

  const handleReset = useCallback(
    (e) => {
      e.stopPropagation();
      setSlots(Array(slotCount).fill(null));
      setComplete(false);
    },
    [slotCount]
  );

  const handleClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  // Compute assembled panorama width factoring in overlap
  const thumbWidth = 200;
  const overlapPx = thumbWidth * (overlapPercent / 100);
  const assembledWidth = thumbWidth * slotCount - overlapPx * (slotCount - 1);

  return (
    <div className="slide--panorama-builder" onClick={handleClick}>
      <motion.h2
        className="pb-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="pb-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      {/* Source area */}
      {!complete && (
        <motion.div
          className="pb-source"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {shuffledIndices.map((imgIdx) => {
            if (placedIndices.has(imgIdx)) return null;
            const img = images[imgIdx];
            return (
              <div
                key={imgIdx}
                className="pb-thumb pb-thumb--source"
                draggable
                onDragStart={(e) => handleDragStart(e, imgIdx)}
              >
                <img src={img.src} alt={img.label || ''} draggable={false} />
                {img.label && <span className="pb-thumb-label">{img.label}</span>}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Canvas / drop zones */}
      {!complete && (
        <motion.div
          className="pb-canvas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {Array.from({ length: slotCount }).map((_, slotIdx) => {
            const imgIdx = slots[slotIdx];
            const filled = imgIdx !== null;
            const correct = filled && isCorrect(slotIdx, imgIdx);
            return (
              <div
                key={slotIdx}
                className={`pb-slot ${filled ? 'pb-slot--filled' : ''} ${correct ? 'pb-slot--correct' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slotIdx)}
              >
                {filled ? (
                  <div
                    className="pb-thumb"
                    draggable
                    onDragStart={(e) => handleDragStart(e, imgIdx)}
                  >
                    <img src={images[imgIdx].src} alt="" draggable={false} />
                  </div>
                ) : (
                  <span className="pb-slot-placeholder">?</span>
                )}
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Assembled panorama */}
      <AnimatePresence>
        {complete && (
          <motion.div
            className="pb-assembled-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="pb-assembled" style={{ width: assembledWidth }}>
              {targetOrder.map((imgIdx, i) => (
                <motion.img
                  key={imgIdx}
                  className="pb-assembled-img"
                  src={images[imgIdx].src}
                  alt=""
                  draggable={false}
                  style={{
                    width: thumbWidth,
                    left: i * (thumbWidth - overlapPx),
                    zIndex: i,
                  }}
                  initial={{ x: 0 }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                />
              ))}
            </div>
            <motion.p
              className="pb-complete-msg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              Panorama Complete!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset button */}
      <button className="pb-reset" onClick={handleReset}>
        Reset
      </button>
    </div>
  );
}
