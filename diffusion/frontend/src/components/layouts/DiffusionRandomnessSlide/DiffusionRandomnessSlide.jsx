import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './DiffusionRandomnessSlide.css';

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function NoiseCanvas({ seed, size = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const rng = mulberry32(seed);
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.round(rng() * 255);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
  }, [seed, size]);

  return <canvas ref={canvasRef} className="dr-noise-canvas" />;
}

export default function DiffusionRandomnessSlide({ slide, buildStep }) {
  const results = slide.results || [];

  return (
    <div className="slide--diffusion-randomness">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.description && (
        <motion.p
          className="dr-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {slide.description}
        </motion.p>
      )}

      {/* Diagram: prompt → noise → model → different results */}
      {buildStep >= 0 && (
        <motion.div
          className="dr-diagram"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="dr-prompt-bar">
            <span className="dr-prompt-icon">T</span>
            <span className="dr-prompt-text">&ldquo;{slide.prompt}&rdquo;</span>
          </div>

          <div className="dr-channels">
            {results.map((result, i) => (
              <motion.div
                key={i}
                className="dr-channel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
              >
                <div className="dr-noise-box">
                  <NoiseCanvas seed={42 + i * 1000} />
                  <span className="dr-label">Noise {i + 1}</span>
                </div>
                <div className="dr-channel-arrow">&darr;</div>
                <div className="dr-model-tag">Diffusion Model</div>
                <div className="dr-channel-arrow">&darr;</div>
                <div className="dr-result-box">
                  <img src={result.src} alt="" className="dr-result-img" />
                  <span className="dr-label">{result.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Insight cards */}
      <div className="dr-insights">
        {buildStep >= 1 && slide.limitation && (
          <motion.div
            className="dr-insight dr-insight--limitation"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="dr-insight-title">{slide.limitation.title}</span>
            <span className="dr-insight-text">{slide.limitation.text}</span>
          </motion.div>
        )}

        {buildStep >= 2 && slide.detection && (
          <motion.div
            className="dr-insight dr-insight--detection"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="dr-insight-title">{slide.detection.title}</span>
            <span className="dr-insight-text">{slide.detection.text}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
