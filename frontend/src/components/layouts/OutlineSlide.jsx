import { motion } from 'framer-motion';

export default function OutlineSlide({ slide, sections }) {
  const activeId = slide.activeSection;

  // Determine which sections are before (completed), active, or after
  const activeIdx = sections.findIndex(s => s.id === activeId);

  return (
    <div className="slide--outline">
      <h2>Outline</h2>
      <ul className="outline-list">
        {sections.map((section, i) => {
          let cls = 'outline-item';
          if (i === activeIdx) cls += ' outline-item--active';
          else if (i < activeIdx) cls += ' outline-item--completed';

          return (
            <motion.li
              key={section.id}
              className={cls}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <span className="outline-number">{i + 1}</span>
              {section.title}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
