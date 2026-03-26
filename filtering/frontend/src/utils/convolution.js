/**
 * Shared convolution utilities used by FilterDesignerSlide, MultiFilterCompareSlide, and FilterStackSlide.
 */

/**
 * Compute raw convolution (no normalization) — returns Float32Array of RGB triples.
 */
export function applyConvolutionRaw(imageData, kernel) {
  const { width, height, data } = imageData;
  const kSize = kernel.length;
  const pad = Math.floor(kSize / 2);
  const pixelCount = width * height;

  const raw = new Float32Array(pixelCount * 3);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0;

      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const sy = Math.min(height - 1, Math.max(0, y + ky - pad));
          const sx = Math.min(width - 1, Math.max(0, x + kx - pad));
          const idx = (sy * width + sx) * 4;
          const kVal = kernel[ky][kx];
          rSum += data[idx] * kVal;
          gSum += data[idx + 1] * kVal;
          bSum += data[idx + 2] * kVal;
        }
      }

      const ri = (y * width + x) * 3;
      raw[ri] = rSum;
      raw[ri + 1] = gSum;
      raw[ri + 2] = bSum;
    }
  }

  return { raw, width, height };
}

/**
 * Normalize a raw Float32Array (RGB triples) to ImageData [0, 255].
 */
export function normalizeRawToImageData(raw, width, height) {
  let min = raw[0], max = raw[0];
  for (let i = 1; i < raw.length; i++) {
    if (raw[i] < min) min = raw[i];
    if (raw[i] > max) max = raw[i];
  }

  const range = max - min;
  const output = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ri = (y * width + x) * 3;
      const oIdx = (y * width + x) * 4;
      output[oIdx] = range > 0 ? Math.round(((raw[ri] - min) / range) * 255) : 128;
      output[oIdx + 1] = range > 0 ? Math.round(((raw[ri + 1] - min) / range) * 255) : 128;
      output[oIdx + 2] = range > 0 ? Math.round(((raw[ri + 2] - min) / range) * 255) : 128;
      output[oIdx + 3] = 255;
    }
  }

  return new ImageData(output, width, height);
}

/**
 * Apply convolution and return normalized ImageData (drop-in replacement for original).
 */
export function applyConvolution(imageData, kernel) {
  const { raw, width, height } = applyConvolutionRaw(imageData, kernel);
  return normalizeRawToImageData(raw, width, height);
}

/**
 * Combine two raw convolution outputs via edge magnitude: sqrt(x² + y²).
 * Returns normalized ImageData.
 */
export function combineEdgeMagnitude(rawX, rawY, width, height) {
  const pixelCount = width * height;
  const combined = new Float32Array(pixelCount * 3);

  for (let i = 0; i < pixelCount * 3; i++) {
    combined[i] = Math.sqrt(rawX[i] * rawX[i] + rawY[i] * rawY[i]);
  }

  return normalizeRawToImageData(combined, width, height);
}
