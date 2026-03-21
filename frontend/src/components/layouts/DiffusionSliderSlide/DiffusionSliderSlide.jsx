import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import useCanvasNoise from './useCanvasNoise.js';
import './DiffusionSliderSlide.css';

export default function DiffusionSliderSlide({ slide }) {
  const steps = slide.steps || 50;
  const images = slide.images || [{ src: slide.sourceImage, label: 'Image' }];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animFrameRef = useRef(null);
  const playStartRef = useRef(null);

  const { canvasRef, renderFrame } = useCanvasNoise(images[selectedIndex].src);

  const noiseLevel = step / steps;

  // Update canvas when step changes
  useEffect(() => {
    renderFrame(noiseLevel);
  }, [noiseLevel, renderFrame]);

  // Re-render at current noise level when image changes
  useEffect(() => {
    // Small delay to let the image load before rendering the noise frame
    const timer = setTimeout(() => renderFrame(noiseLevel), 100);
    return () => clearTimeout(timer);
  }, [selectedIndex]);

  const handleSliderChange = useCallback((e) => {
    setStep(Number(e.target.value));
    setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleImageSelect = useCallback((index) => {
    setSelectedIndex(index);
  }, []);

  // Auto-play animation
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    setIsPlaying(true);
    const startStep = step >= steps ? 0 : step;
    setStep(startStep);
    playStartRef.current = { time: performance.now(), startStep };

    const duration = 3000;

    const animate = (now) => {
      const elapsed = now - playStartRef.current.time;
      const progress = Math.min(elapsed / duration, 1);
      const currentStep = Math.round(
        playStartRef.current.startStep + (steps - playStartRef.current.startStep) * progress
      );
      setStep(currentStep);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying, step, steps]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const labels = slide.labels || { left: 'Clean Image (t=0)', right: 'Pure Noise (t=T)' };

  return (
    <div className="slide--diffusion-slider" onClick={(e) => e.stopPropagation()}>
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="diffusion-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      <motion.div
        className="diffusion-body"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {/* Image selector thumbnails */}
        <div className="diffusion-image-picker">
          {images.map((img, i) => (
            <button
              key={i}
              className={`diffusion-thumb ${i === selectedIndex ? 'diffusion-thumb--active' : ''}`}
              onClick={() => handleImageSelect(i)}
              title={img.label}
            >
              <img src={img.src} alt={img.label} />
              <span className="diffusion-thumb-label">{img.label}</span>
            </button>
          ))}
        </div>

        {/* Canvas + controls */}
        <div className="diffusion-main">
          <div className="diffusion-canvas-container">
            <canvas ref={canvasRef} className="diffusion-canvas" />
          </div>

          <div className="diffusion-controls">
            <div className="diffusion-slider-row">
              <input
                type="range"
                min={0}
                max={steps}
                value={step}
                onChange={handleSliderChange}
                className="diffusion-slider"
              />
            </div>
            <div className="diffusion-labels">
              <span className="diffusion-label-left">{labels.left}</span>
              <span className="diffusion-step-indicator">t = {step} / {steps}</span>
              <span className="diffusion-label-right">{labels.right}</span>
            </div>
            <button className="diffusion-play-btn" onClick={togglePlay}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
