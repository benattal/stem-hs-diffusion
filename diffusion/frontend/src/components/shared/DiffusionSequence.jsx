import { useState, useEffect, useRef } from 'react';
import './DiffusionSequence.css';

// Seeded pseudo-random number generator (Mulberry32)
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussianPair(rng) {
  const u1 = rng();
  const u2 = rng();
  const mag = Math.sqrt(-2 * Math.log(u1 + 1e-10));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

function renderNoised(ctx, srcData, noiseData, width, height, noiseLevel) {
  const len = srcData.length;
  const out = new Uint8ClampedArray(len);
  const t = noiseLevel;
  const alphaBar = Math.cos((t * Math.PI) / 2) ** 2;
  const sqrtAlpha = Math.sqrt(alphaBar);
  const sqrtOneMinusAlpha = Math.sqrt(1 - alphaBar);

  for (let i = 0; i < len; i += 4) {
    out[i] = sqrtAlpha * srcData[i] + sqrtOneMinusAlpha * noiseData[i];
    out[i + 1] = sqrtAlpha * srcData[i + 1] + sqrtOneMinusAlpha * noiseData[i + 1];
    out[i + 2] = sqrtAlpha * srcData[i + 2] + sqrtOneMinusAlpha * noiseData[i + 2];
    out[i + 3] = 255;
  }

  ctx.putImageData(new ImageData(out, width, height), 0, 0);
}

export default function DiffusionSequence({
  imageSrc,
  frameCount = 6,
  reverse = true,
  size = 'normal',
}) {
  const [frames, setFrames] = useState([]);
  const canvasRef = useRef(document.createElement('canvas'));

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = canvasRef.current;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);
      const srcData = ctx.getImageData(0, 0, w, h).data;

      const rng = mulberry32(42);
      const len = w * h * 4;
      const noiseData = new Uint8ClampedArray(len);
      for (let i = 0; i < len; i += 4) {
        const [r1, r2] = gaussianPair(rng);
        const [g1] = gaussianPair(rng);
        noiseData[i] = Math.round(128 + r1 * 60);
        noiseData[i + 1] = Math.round(128 + r2 * 60);
        noiseData[i + 2] = Math.round(128 + g1 * 60);
        noiseData[i + 3] = 255;
      }

      const newFrames = [];
      for (let i = 0; i < frameCount; i++) {
        const noiseLevel = i / (frameCount - 1);
        renderNoised(ctx, srcData, noiseData, w, h, noiseLevel);
        newFrames.push(canvas.toDataURL('image/jpeg', 0.85));
      }

      if (reverse) newFrames.reverse();
      setFrames(newFrames);
    };
    img.src = imageSrc;
  }, [imageSrc, frameCount, reverse]);

  if (frames.length === 0) return null;

  return (
    <div className={`diffusion-seq diffusion-seq--${size}`}>
      <div className="diffusion-seq-row">
        {frames.map((src, i) => (
          <div key={i} className="diffusion-seq-item">
            <img src={src} alt="" className="diffusion-seq-img" />
            {i < frames.length - 1 && (
              <span className="diffusion-seq-arrow">&rarr;</span>
            )}
          </div>
        ))}
      </div>
      <div className="diffusion-seq-labels">
        <span className="diffusion-seq-label">Noise</span>
        <span className="diffusion-seq-label">Clean image</span>
      </div>
    </div>
  );
}
