import { useRef, useEffect, useCallback } from 'react';

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

// Box-Muller transform for Gaussian noise
function gaussianPair(rng) {
  const u1 = rng();
  const u2 = rng();
  const mag = Math.sqrt(-2 * Math.log(u1 + 1e-10));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

export default function useCanvasNoise(imageSrc) {
  const canvasRef = useRef(null);
  const imageDataRef = useRef(null);
  const noiseDataRef = useRef(null);
  const imageLoadedRef = useRef(false);

  // Pre-generate full-color noise (independent R, G, B channels)
  const generateNoise = useCallback((width, height) => {
    const rng = mulberry32(42);
    const len = width * height * 4;
    const noise = new Uint8ClampedArray(len);
    for (let i = 0; i < len; i += 4) {
      // Each channel gets its own independent Gaussian sample
      const [r1, r2] = gaussianPair(rng);
      const [g1, g2] = gaussianPair(rng);
      // Use g2 for blue since we have a spare value
      noise[i] = Math.round(128 + r1 * 60);     // R
      noise[i + 1] = Math.round(128 + r2 * 60);  // G
      noise[i + 2] = Math.round(128 + g1 * 60);  // B
      noise[i + 3] = 255;
    }
    return noise;
  }, []);

  // Load image — re-runs when imageSrc changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    imageLoadedRef.current = false;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      imageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      noiseDataRef.current = generateNoise(canvas.width, canvas.height);
      imageLoadedRef.current = true;
      // Draw clean image initially
      ctx.putImageData(
        new ImageData(new Uint8ClampedArray(imageDataRef.current), canvas.width, canvas.height),
        0, 0
      );
    };
    img.src = imageSrc;
  }, [imageSrc, generateNoise]);

  // Render frame at a given noise level (0 = clean, 1 = full noise)
  const renderFrame = useCallback((noiseLevel) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoadedRef.current) return;
    const ctx = canvas.getContext('2d');
    const src = imageDataRef.current;
    const noise = noiseDataRef.current;
    const len = src.length;
    const out = new Uint8ClampedArray(len);

    // Cosine schedule similar to real diffusion models
    const t = noiseLevel;
    const alphaBar = Math.cos((t * Math.PI) / 2) ** 2;
    const sqrtAlpha = Math.sqrt(alphaBar);
    const sqrtOneMinusAlpha = Math.sqrt(1 - alphaBar);

    for (let i = 0; i < len; i += 4) {
      out[i] = sqrtAlpha * src[i] + sqrtOneMinusAlpha * noise[i];
      out[i + 1] = sqrtAlpha * src[i + 1] + sqrtOneMinusAlpha * noise[i + 1];
      out[i + 2] = sqrtAlpha * src[i + 2] + sqrtOneMinusAlpha * noise[i + 2];
      out[i + 3] = 255;
    }

    ctx.putImageData(new ImageData(out, canvas.width, canvas.height), 0, 0);
  }, []);

  return { canvasRef, renderFrame, imageLoaded: imageLoadedRef };
}
