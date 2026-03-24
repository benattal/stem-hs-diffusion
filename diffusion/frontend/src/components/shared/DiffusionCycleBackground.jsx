import { useEffect, useRef } from 'react';

const FRAME_COUNT = 18;
const HOLD_FRAMES = 15;
const CYCLE_INTERVAL = 60; // ms per frame
const TILE_SIZE = 160; // px per tile canvas resolution

// ─── Noise utilities ────────────────────────────────────────────
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

function generateNoise(rng, len) {
  const data = new Uint8ClampedArray(len);
  for (let i = 0; i < len; i += 4) {
    const [r1, r2] = gaussianPair(rng);
    const [g1] = gaussianPair(rng);
    data[i] = Math.round(128 + r1 * 60);
    data[i + 1] = Math.round(128 + r2 * 60);
    data[i + 2] = Math.round(128 + g1 * 60);
    data[i + 3] = 255;
  }
  return data;
}

function blendFrame(srcData, noiseData, len, noiseLevel) {
  const out = new Uint8ClampedArray(len);
  const alphaBar = Math.cos((noiseLevel * Math.PI) / 2) ** 2;
  const sqrtAlpha = Math.sqrt(alphaBar);
  const sqrtNoise = Math.sqrt(1 - alphaBar);
  for (let i = 0; i < len; i += 4) {
    out[i] = sqrtAlpha * srcData[i] + sqrtNoise * noiseData[i];
    out[i + 1] = sqrtAlpha * srcData[i + 1] + sqrtNoise * noiseData[i + 1];
    out[i + 2] = sqrtAlpha * srcData[i + 2] + sqrtNoise * noiseData[i + 2];
    out[i + 3] = 255;
  }
  return out;
}

function loadImageData(src, size) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const sw = size / scale;
      const sh = size / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
      resolve(ctx.getImageData(0, 0, size, size).data);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

const DEFAULT_IMAGES = [
  `${base}/slides/clip-model/image19.jpeg`,
  `${base}/slides/clip-interactive/mountain.jpg`,
  `${base}/slides/clip-interactive/pizza.jpg`,
  `${base}/slides/clip-interactive/astronaut.jpg`,
  `${base}/slides/clip-interactive/ocean.jpg`,
  `${base}/slides/clip-interactive/car.jpg`,
  `${base}/slides/clip-interactive/sunflower.jpg`,
  `${base}/slides/clip-model/image20.jpeg`,
  `${base}/slides/clip-interactive/kitten.jpg`,
  `${base}/slides/clip-interactive/forest.jpg`,
  `${base}/slides/clip-interactive/cake.jpg`,
  `${base}/slides/clip-interactive/sushi.jpg`,
  `${base}/slides/clip-interactive/bicycle.jpg`,
  `${base}/slides/clip-interactive/puppy.jpg`,
  `${base}/slides/clip-interactive/artist.jpg`,
];

// ─── Mosaic of tiles, each cycling through diffusion independently ───

export default function DiffusionCycleBackground({ images = DEFAULT_IMAGES, opacity = 0.18 }) {
  const containerRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    let timerId;

    async function init() {
      // Determine grid size from container
      const rect = container.getBoundingClientRect();
      const cols = Math.ceil(rect.width / TILE_SIZE);
      const rows = Math.ceil(rect.height / TILE_SIZE);
      const tileCount = cols * rows;

      // Load all images at tile resolution
      const loaded = (await Promise.all(images.map((src) => loadImageData(src, TILE_SIZE)))).filter(Boolean);
      if (cancelled || loaded.length === 0) return;

      // Generate one shared noise buffer (all tiles same size)
      const len = TILE_SIZE * TILE_SIZE * 4;
      const rng = mulberry32(42);
      const noiseData = generateNoise(rng, len);

      // Shuffle image assignment so adjacent tiles differ
      const shuffleRng = mulberry32(123);
      const shuffled = [...Array(loaded.length).keys()];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(shuffleRng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Create canvases and per-tile state
      container.innerHTML = '';
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

      const tiles = [];
      for (let i = 0; i < tileCount; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'cover';
        canvas.style.display = 'block';
        container.appendChild(canvas);

        // Stagger: each tile starts at a different phase offset
        const totalCycleFrames = FRAME_COUNT + HOLD_FRAMES + FRAME_COUNT;
        const stagger = Math.floor(shuffleRng() * totalCycleFrames);

        tiles.push({
          canvas,
          ctx: canvas.getContext('2d'),
          imgIdx: shuffled[i % shuffled.length],
          frame: stagger,
        });
      }

      stateRef.current = { tiles, loaded, noiseData, len };

      function tick() {
        const s = stateRef.current;
        if (!s) return;

        for (const tile of s.tiles) {
          const totalCycle = FRAME_COUNT + HOLD_FRAMES + FRAME_COUNT;
          const t = tile.frame % totalCycle;
          const srcData = s.loaded[tile.imgIdx];

          let noiseLevel;
          if (t < FRAME_COUNT) {
            // Reverse: noise → clean
            noiseLevel = 1 - t / FRAME_COUNT;
          } else if (t < FRAME_COUNT + HOLD_FRAMES) {
            // Hold clean
            noiseLevel = 0;
          } else {
            // Forward: clean → noise
            noiseLevel = (t - FRAME_COUNT - HOLD_FRAMES) / FRAME_COUNT;
          }

          if (noiseLevel === 0) {
            tile.ctx.putImageData(new ImageData(new Uint8ClampedArray(srcData), TILE_SIZE, TILE_SIZE), 0, 0);
          } else {
            const pixels = blendFrame(srcData, s.noiseData, s.len, noiseLevel);
            tile.ctx.putImageData(new ImageData(pixels, TILE_SIZE, TILE_SIZE), 0, 0);
          }

          tile.frame++;
          // When cycle completes, move to next image
          if (tile.frame % totalCycle === 0) {
            tile.imgIdx = (tile.imgIdx + 1) % s.loaded.length;
          }
        }
      }

      timerId = setInterval(tick, CYCLE_INTERVAL);
    }

    init();
    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }, [images]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
