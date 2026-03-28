import './TwoImageSlide.css';

export default function TwoImageSlide({ slide }) {
  const { title, leftSrc, rightSrc, caption } = slide;

  return (
    <div className="slide--two-image">
      {title && <h2 className="two-image__title">{title}</h2>}
      <div className="two-image__body">
        <img src={leftSrc} alt="" className="two-image__img" />
        <img src={rightSrc} alt="" className="two-image__img" />
      </div>
      {caption && <p className="two-image__caption">{caption}</p>}
    </div>
  );
}
