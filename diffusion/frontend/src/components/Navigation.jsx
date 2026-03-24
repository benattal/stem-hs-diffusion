export default function Navigation({
  currentIndex,
  totalSlides,
  flatSlides,
  sectionTitle,
  goNext,
  goPrev,
  goToSlide,
  isFirst,
  isLast,
}) {
  return (
    <div className="navigation" onClick={(e) => e.stopPropagation()}>
      <div className="nav-section-label"></div>
      <div className="nav-controls">
        <button
          className="nav-btn"
          onClick={goPrev}
          disabled={isFirst}
          aria-label="Previous slide"
        >
          &#8592;
        </button>

        <div className="nav-dots">
          {flatSlides.map((slide, i) => (
            <button
              key={slide.id}
              className={`nav-dot${i === currentIndex ? ' nav-dot--active' : ''}${slide.slideIndexInSection === 0 ? ' nav-dot--section-start' : ''}`}
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="nav-btn"
          onClick={goNext}
          disabled={isLast}
          aria-label="Next slide"
        >
          &#8594;
        </button>
      </div>

      <div className="nav-slide-counter">
        {currentIndex + 1} / {totalSlides}
      </div>
    </div>
  );
}
