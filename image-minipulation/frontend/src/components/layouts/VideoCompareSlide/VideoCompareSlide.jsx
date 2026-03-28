import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './VideoCompareSlide.css';

export default function VideoCompareSlide({ slide, buildStep }) {
  const videosRef = useRef([]);

  const videos = slide.videos || [];
  const layout = slide.layout_mode || (videos.length === 1 ? 'single' : videos.length === 3 ? 'three-up' : 'two-up');

  useEffect(() => {
    videosRef.current.forEach((video) => {
      if (!video) return;
      video.currentTime = 0;
      video.play().catch(() => {});
    });
  }, [videos]);

  return (
    <div className="slide--video-compare">
      <motion.h2
        className="vc-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {slide.title}
      </motion.h2>

      {slide.subtitle && (
        <motion.p
          className="vc-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {slide.subtitle}
        </motion.p>
      )}

      <motion.div
        className={`vc-row vc-row--${layout}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {videos.map((v, i) => (
          <div className="vc-item" key={i}>
            <div className="vc-video-container">
              <video
                ref={(el) => { videosRef.current[i] = el; }}
                src={v.src}
                autoPlay
                muted
                loop
                playsInline
                className="vc-video"
              />
            </div>
            {v.label && <span className="vc-label">{v.label}</span>}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
