import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './NoiseDefinitionSlide.css';

// Deterministic noise generator (Mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ImageNoiseDemo({ imageSrc }) {
  const cleanRef = useRef(null);
  const noisyRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = Math.min(img.naturalWidth, 280);
      const h = Math.round(w * (img.naturalHeight / img.naturalWidth));

      // Clean canvas
      const cleanCanvas = cleanRef.current;
      cleanCanvas.width = w;
      cleanCanvas.height = h;
      const cleanCtx = cleanCanvas.getContext('2d');
      cleanCtx.drawImage(img, 0, 0, w, h);

      // Noisy canvas
      const noisyCanvas = noisyRef.current;
      noisyCanvas.width = w;
      noisyCanvas.height = h;
      const noisyCtx = noisyCanvas.getContext('2d');
      noisyCtx.drawImage(img, 0, 0, w, h);

      const srcData = noisyCtx.getImageData(0, 0, w, h);
      const data = srcData.data;
      const rng = mulberry32(42);

      for (let i = 0; i < data.length; i += 4) {
        const noise = (rng() - 0.5) * 180;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
      }

      noisyCtx.putImageData(srcData, 0, 0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  return (
    <div className="nd-image-demo">
      <div className="nd-image-pair">
        <div className="nd-image-item">
          <canvas ref={cleanRef} className="nd-canvas" />
          <span className="nd-pair-label">Clean image</span>
        </div>
        <div className="nd-pair-arrow">&rarr;</div>
        <div className="nd-image-item">
          <canvas ref={noisyRef} className="nd-canvas" />
          <span className="nd-pair-label">Image + noise</span>
        </div>
      </div>
    </div>
  );
}

function AnimatedWaveform({ width, height, stroke, noiseAmount = 0 }) {
  const pathRef = useRef(null);
  const frameRef = useRef(null);
  const mid = height / 2;
  const amp = mid - 10;

  useEffect(() => {
    let t = 0;
    let seed = 99;
    const animate = () => {
      t += 0.04;
      // Fresh RNG each frame for independent noise
      seed++;
      const frameRng = noiseAmount > 0 ? mulberry32(seed) : null;
      let d = `M 0 ${mid}`;
      for (let i = 0; i <= width / 2; i++) {
        const x = i * 2;
        const phase = (x / width) * Math.PI * 6 - t;
        const signal = Math.sin(phase) * amp;
        const noise = frameRng ? (frameRng() - 0.5) * 55 : 0;
        const y = Math.max(2, Math.min(height - 2, mid + signal + noise));
        d += ` L ${x} ${y}`;
      }
      if (pathRef.current) pathRef.current.setAttribute('d', d);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [width, height, mid, amp, noiseAmount]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="nd-waveform">
      <path ref={pathRef} fill="none" stroke={stroke} strokeWidth="2" />
    </svg>
  );
}

function AudioNoiseDemo() {
  const width = 260;
  const height = 70;

  return (
    <div className="nd-audio-demo">
      <div className="nd-audio-pair">
        <div className="nd-audio-item">
          <AnimatedWaveform width={width} height={height} stroke="var(--accent-secondary)" noiseAmount={0} />
          <span className="nd-pair-label">Clean audio</span>
        </div>
        <div className="nd-pair-arrow">&rarr;</div>
        <div className="nd-audio-item">
          <AnimatedWaveform width={width} height={height} stroke="#ff6b6b" noiseAmount={1} />
          <span className="nd-pair-label">Audio + noise</span>
        </div>
      </div>
    </div>
  );
}

export default function NoiseDefinitionSlide({ slide, buildStep }) {
  return (
    <div className="slide--noise-definition">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {/* Definition */}
      {buildStep >= 0 && (
        <motion.div
          className="nd-definition"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="nd-def-term">Noise</span>
          <span className="nd-def-equals">=</span>
          <span className="nd-def-meaning">{slide.definition}</span>
        </motion.div>
      )}

      {/* Analogy */}
      {buildStep >= 1 && (
        <motion.div
          className="nd-analogy"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="nd-analogy-header">
            Why is it called &ldquo;noise&rdquo;?
          </div>
          <p className="nd-analogy-text">
            Think of <strong>&ldquo;{slide.analogy.term}&rdquo;</strong> &mdash; {slide.analogy.explanation}
          </p>
        </motion.div>
      )}

      {/* Examples */}
      <div className="nd-examples">
        {slide.examples.map((example, i) =>
          buildStep >= 2 + i && (
            <motion.div
              key={example.type}
              className="nd-example"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="nd-example-label">{example.label}</div>
              <p className="nd-example-desc">{example.description}</p>
              {example.type === 'image' && <ImageNoiseDemo imageSrc={example.imageSrc} />}
              {example.type === 'audio' && <AudioNoiseDemo />}
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}
