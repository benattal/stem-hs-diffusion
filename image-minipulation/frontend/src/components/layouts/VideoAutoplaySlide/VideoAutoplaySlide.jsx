import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './VideoAutoplaySlide.css';

export default function VideoAutoplaySlide({ slide, buildStep }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    video.play().catch(() => {});
  }, [slide.video]);

  return (
    <div
      className="slide--video-autoplay"
      style={slide.bgColor ? { background: slide.bgColor } : undefined}
    >
      {slide.nextVideo && (
        <link rel="preload" as="video" href={slide.nextVideo} />
      )}

      <motion.div
        className="video-autoplay__header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.headerTitle}
      </motion.div>

      <motion.div
        className="video-autoplay__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <video
          ref={videoRef}
          src={slide.video}
          muted
          playsInline
          className="video-autoplay__video"
        />
      </motion.div>
    </div>
  );
}
