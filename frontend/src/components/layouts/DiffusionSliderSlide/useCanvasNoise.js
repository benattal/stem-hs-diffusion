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

export default function useCanvasNoise(imageSrc, steps = 50) {
  const canvasRef = useRef(null);
  const imageDataRef = useRef(null);
  const noiseDataRef = useRef(null);
  const imageLoadedRef = useRef(false);

  // Pre-generate full noise frame once the image dimensions are known
  const generateNoise = useCallback((width, height) => {
    const rng = mulberry32(42);
    const noise = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < noise.length; i += 4) {
      const [g1, g2] = gaussianPair(rng);
      const val1 = Math.round(128 + g1 * 60);
      const val2 = Math.round(128 + g2 * 60);
      noise[i] = val1;
      noise[i + 1] = val1;
      noise[i + 2] = val1;
      noise[i + 3] = 255;
      if (i + 4 < noise.length) {
        noise[i + 4] = val2;
        noise[i + 5] = val2;
        noise[i + 6] = val2;
        noise[i + 7] = 255;
        i += 4;
      }
    }
    return noise;
  }, []);

  // Load image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
      ctx.putImageData(new ImageData(new Uint8ClampedArray(imageDataRef.current), canvas.width, canvas.height), 0, 0);
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

    // Use a cosine schedule similar to real diffusion models
    // alpha_bar goes from 1 (clean) to ~0 (noise)
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
