import { useEffect, useRef, useState } from 'react';
import './FiveVideoSlide.css';

export default function FiveVideoSlide({ slide }) {
  const { title, videos } = slide;
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === activeIndex) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeIndex]);

  function handleEnded() {
    setActiveIndex(i => (i + 1) % videos.length);
  }

  return (
    <div className="slide--five-video">
      {title && <h2 className="five-video__title">{title}</h2>}
      <div className="five-video__body">
        {videos.map((v, i) => (
          <div key={i} className="five-video__column">
            {v.label && <div className="five-video__label">{v.label}</div>}
            <video
              ref={el => videoRefs.current[i] = el}
              src={v.src}
              muted
              playsInline
              className="five-video__video"
              onEnded={handleEnded}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
