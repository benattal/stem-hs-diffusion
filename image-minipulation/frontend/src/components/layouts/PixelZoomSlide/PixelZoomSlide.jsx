import './PixelZoomSlide.css';

export default function PixelZoomSlide({ slide }) {
  const { title, imageSrc } = slide;

  return (
    <div className="slide--pixel-zoom">
      <h2 className="pixel-zoom__title">{title}</h2>
      <div className="pixel-zoom__body">
        <img
          src={imageSrc}
          alt={title}
          className="pixel-zoom__image"
        />
      </div>
    </div>
  );
}
