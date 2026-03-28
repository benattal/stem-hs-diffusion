import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import './RetouchingSliderSlide.css';

export default function RetouchingSliderSlide({ slide, buildStep }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const beforeLabel = slide.beforeLabel || 'Before';
  const afterLabel = slide.afterLabel || 'After';

  const updatePosition = useCallback((clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(pct);
  }, []);

  const onPointerDown = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.stopPropagation();
    updatePosition(e.clientX);
  }, [updatePosition]);

  const onPointerUp = useCallback((e) => {
    dragging.current = false;
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="slide--retouching-slider" onClick={handleClick}>
      <motion.h2
        className="rs-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      <motion.div
        className="rs-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div
          className="rs-container"
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* After image (full, sits behind) */}
          <img
            className="rs-image rs-image--after"
            src={slide.afterImage}
            alt={afterLabel}
            draggable={false}
          />

          {/* Before image (clipped) */}
          <div
            className="rs-before-clip"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              className="rs-image rs-image--before"
              src={slide.beforeImage}
              alt={beforeLabel}
              draggable={false}
            />
          </div>

          {/* Divider line */}
          <div
            className="rs-divider"
            style={{ left: `${position}%` }}
          >
            <div className="rs-divider-line" />
            <div className="rs-divider-handle">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#fff" strokeWidth="2" />
                <path d="M7 7L4 10L7 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 7L16 10L13 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <span className="rs-label rs-label--before">{beforeLabel}</span>
          <span className="rs-label rs-label--after">{afterLabel}</span>
        </div>
      </motion.div>
    </div>
  );
}
