import { useEffect, useRef } from 'react';
import './ThreeVideoSlide.css';

function VideoColumn({ src, label }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  }, [src]);

  return (
    <div className="three-video__column">
      {label && <div className="three-video__label">{label}</div>}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        className="three-video__video"
      />
    </div>
  );
}

export default function ThreeVideoSlide({ slide }) {
  const { title, videos } = slide;

  return (
    <div className="slide--three-video">
      {title && <h2 className="three-video__title">{title}</h2>}
      <div className="three-video__body">
        {videos.map((v, i) => (
          <VideoColumn key={i} src={v.src} label={v.label} />
        ))}
      </div>
    </div>
  );
}
