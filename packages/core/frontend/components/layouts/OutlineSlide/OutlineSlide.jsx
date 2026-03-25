import './OutlineSlide.css';

export default function OutlineSlide({ slide, sections }) {
  const activeId = slide.activeSection;

  // Determine which sections are before (completed), active, or after
  const activeIdx = sections.findIndex(s => s.id === activeId);

  return (
    <div className="slide--outline">
      <div className="section-label">Outline</div>
      <ul className="outline-list">
        {sections.map((section, i) => {
          let cls = 'outline-item';
          if (i === activeIdx) cls += ' outline-item--active';
          else if (i < activeIdx) cls += ' outline-item--completed';

          return (
            <li key={section.id} className={cls}>
              <span className="outline-number">{i + 1}</span>
              {section.title}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
