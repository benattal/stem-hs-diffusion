import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TemporalBlurDemoSlide.css';

const DISPLAY_WIDTH = 400;

function useFrameExtraction(videoSrc, frameCount) {
  const [frames, setFrames] = useState([]);
  const [partialAverages, setPartialAverages] = useState([]);
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
      const partialAvgs = [];
      const accumulator = new Float32Array(dw * dh * 4);
      let frameIdx = 0;

      function seekNext() {
        if (frameIdx >= frameCount) {
          setFrames(extractedFrames);
          setPartialAverages(partialAvgs);
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

        // Compute partial average (average of frames 0..frameIdx)
        const n = frameIdx + 1;
        const avgCanvas = document.createElement('canvas');
        avgCanvas.width = dw;
        avgCanvas.height = dh;
        const avgCtx = avgCanvas.getContext('2d');
        const avgData = avgCtx.createImageData(dw, dh);
        for (let i = 0; i < accumulator.length; i++) {
          avgData.data[i] = Math.round(accumulator[i] / n);
        }
        for (let i = 3; i < avgData.data.length; i += 4) {
          avgData.data[i] = 255;
        }
        avgCtx.putImageData(avgData, 0, 0);
        partialAvgs.push(avgCanvas.toDataURL('image/jpeg', 0.9));

        frameIdx++;
        seekNext();
      });

      seekNext();
    });

    video.src = videoSrc;
    video.load();
  }, [videoSrc, frameCount]);

  return { frames, partialAverages, isExtracting, extract };
}

export default function TemporalBlurDemoSlide({ slide, buildStep }) {
  const { title, videoSrc, frameCount = 10 } = slide;
  const { frames, partialAverages, isExtracting, extract } = useFrameExtraction(videoSrc, frameCount);

  // Start extraction when we reach step 1
  useEffect(() => {
    if (buildStep >= 1) {
      extract();
    }
  }, [buildStep, extract]);

  // Animate through frames one at a time when step 2 is reached
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [animationDone, setAnimationDone] = useState(false);
  const animTimerRef = useRef(null);
  const animStartedRef = useRef(false);

  // Reset animation when navigating away from step 2
  useEffect(() => {
    if (buildStep < 2) {
      animStartedRef.current = false;
      setHighlightIdx(-1);
      setAnimationDone(false);
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    }
  }, [buildStep]);

  // Start animation when reaching step 2
  useEffect(() => {
    if (buildStep >= 2 && partialAverages.length > 0 && !animStartedRef.current) {
      animStartedRef.current = true;
      let idx = 0;
      setHighlightIdx(0);

      animTimerRef.current = setInterval(() => {
        idx++;
        if (idx >= frames.length) {
          clearInterval(animTimerRef.current);
          animTimerRef.current = null;
          setAnimationDone(true);
          return;
        }
        setHighlightIdx(idx);
      }, 600);
    }

    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    };
  }, [buildStep, partialAverages.length, frames.length]);

  const frameThumbWidth = Math.min(90, Math.floor(800 / frameCount));
  const showAverage = buildStep >= 2 && partialAverages.length > 0;
  const currentAvgIdx = animationDone ? partialAverages.length - 1 : highlightIdx;

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
                    {frames.map((src, i) => {
                      const isHighlighted = showAverage && i <= highlightIdx;
                      const isActive = showAverage && i === highlightIdx && !animationDone;
                      return (
                        <motion.div
                          key={i}
                          className={
                            `temporal-frame-wrapper` +
                            (isHighlighted ? ' temporal-frame-included' : '') +
                            (isActive ? ' temporal-frame-active' : '') +
                            (showAverage && !isHighlighted ? ' temporal-frame-dimmed' : '')
                          }
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
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2: Animated averaging result */}
        <AnimatePresence>
          {showAverage && currentAvgIdx >= 0 && (
            <motion.div
              key="average"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="temporal-result-row">
                <div className="temporal-result-section">
                  <motion.div
                    className="temporal-result-label"
                    key={currentAvgIdx}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {animationDone
                      ? `Average of all ${frames.length} frames`
                      : `Average of frames`}
                  </motion.div>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentAvgIdx}
                      src={partialAverages[currentAvgIdx]}
                      alt={`Average of first ${currentAvgIdx + 1} frames`}
                      width={DISPLAY_WIDTH}
                      className="temporal-result-image"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </AnimatePresence>
                </div>
              </div>
              {animationDone && (
                <motion.div
                  className="temporal-insight"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  Temporal blur is an average of images!
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
