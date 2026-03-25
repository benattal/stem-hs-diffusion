import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TemporalBlurDemoSlide.css';

const DISPLAY_WIDTH = 400;

function useFrameExtraction(videoSrc, frameCount) {
  const [frames, setFrames] = useState([]);
  const [averagedFrame, setAveragedFrame] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const extractedRef = useRef(false);

  const extract = useCallback(() => {
    if (extractedRef.current || !videoSrc) return;
    extractedRef.current = true;
    setIsExtracting(true);

    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.preload = 'auto';

    video.addEventListener('loadedmetadata', () => {
      const duration = video.duration;
      const w = video.videoWidth;
      const h = video.videoHeight;
      const scale = DISPLAY_WIDTH / w;
      const dw = DISPLAY_WIDTH;
      const dh = Math.round(h * scale);

      const offscreen = document.createElement('canvas');
      offscreen.width = dw;
      offscreen.height = dh;
      const ctx = offscreen.getContext('2d');

      const extractedFrames = [];
      const accumulator = new Float32Array(dw * dh * 4);
      let frameIdx = 0;

      function seekNext() {
        if (frameIdx >= frameCount) {
          // Compute average
          const avgCanvas = document.createElement('canvas');
          avgCanvas.width = dw;
          avgCanvas.height = dh;
          const avgCtx = avgCanvas.getContext('2d');
          const avgData = avgCtx.createImageData(dw, dh);
          for (let i = 0; i < accumulator.length; i++) {
            avgData.data[i] = Math.round(accumulator[i] / frameCount);
          }
          // Ensure alpha is 255
          for (let i = 3; i < avgData.data.length; i += 4) {
            avgData.data[i] = 255;
          }
          avgCtx.putImageData(avgData, 0, 0);

          setFrames(extractedFrames);
          setAveragedFrame(avgCanvas.toDataURL('image/jpeg', 0.9));
          setIsExtracting(false);
          return;
        }

        const time = (frameIdx / (frameCount - 1)) * Math.max(0, duration - 0.1);
        video.currentTime = time;
      }

      video.addEventListener('seeked', () => {
        ctx.drawImage(video, 0, 0, dw, dh);
        const imageData = ctx.getImageData(0, 0, dw, dh);

        // Accumulate pixel values
        for (let i = 0; i < imageData.data.length; i++) {
          accumulator[i] += imageData.data[i];
        }

        extractedFrames.push(offscreen.toDataURL('image/jpeg', 0.8));
        frameIdx++;
        seekNext();
      });

      seekNext();
    });

    video.src = videoSrc;
    video.load();
  }, [videoSrc, frameCount]);

  return { frames, averagedFrame, isExtracting, extract };
}

export default function TemporalBlurDemoSlide({ slide, buildStep }) {
  const { title, videoSrc, frameCount = 10 } = slide;
  const { frames, averagedFrame, isExtracting, extract } = useFrameExtraction(videoSrc, frameCount);

  // Start extraction when we reach step 1
  useEffect(() => {
    if (buildStep >= 1) {
      extract();
    }
  }, [buildStep, extract]);

  const frameThumbWidth = Math.min(90, Math.floor(800 / frameCount));

  return (
    <div className="slide--temporal-blur">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {title}
      </motion.h2>

      <div className="temporal-blur-content">
        {/* Step 0: Video */}
        <AnimatePresence>
          {buildStep === 0 && (
            <motion.div
              key="video"
              className="temporal-video-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <video src={videoSrc} autoPlay muted loop playsInline />
              <div className="temporal-video-label">Watch this video...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 1: Extracted frames */}
        <AnimatePresence>
          {buildStep >= 1 && (
            <motion.div
              key="frames"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {isExtracting && frames.length === 0 ? (
                <div className="temporal-loading">Extracting frames...</div>
              ) : (
                <>
                  <div className="temporal-video-label">
                    {frameCount} frames extracted from the video:
                  </div>
                  <div className="temporal-frames-strip">
                    {frames.map((src, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                      >
                        <img
                          className="temporal-frame"
                          src={src}
                          alt={`Frame ${i + 1}`}
                          width={frameThumbWidth}
                        />
                        <div className="temporal-frame-label">#{i + 1}</div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Averaged result */}
        <AnimatePresence>
          {buildStep >= 2 && averagedFrame && (
            <motion.div
              key="average"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="temporal-result-row">
                <div className="temporal-result-section">
                  <div className="temporal-result-label">Average of all frames</div>
                  <img
                    src={averagedFrame}
                    alt="Averaged frames"
                    width={DISPLAY_WIDTH}
                    style={{ borderRadius: 'var(--radius)', border: '2px solid var(--accent)' }}
                  />
                </div>
              </div>
              <motion.div
                className="temporal-insight"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Temporal blur is an average of images!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
