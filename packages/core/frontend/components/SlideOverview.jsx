export default function SlideOverview({ flatSlides, currentIndex, onSelect, onClose }) {
  return (
    <div className="slide-overview" onClick={onClose}>
      <h2>Slide Overview</h2>
      <div className="overview-grid" onClick={(e) => e.stopPropagation()}>
        {flatSlides.map((slide, i) => (
          <div
            key={slide.id}
            className={`overview-card${i === currentIndex ? ' overview-card--active' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="overview-card-number">Slide {i + 1}</div>
            <div className="overview-card-title">
              {slide.title || slide.layout}
            </div>
            <div className="overview-card-section">{slide.sectionTitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
