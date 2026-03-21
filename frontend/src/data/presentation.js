import presentationData from './presentation.json';

/**
 * Deep-clone the JSON data so we can mutate it freely.
 */
const presentation = JSON.parse(JSON.stringify(presentationData));

/**
 * Helper: find a slide by its id across all sections.
 * Returns the slide object (mutable reference) or undefined.
 */
function findSlide(id) {
  for (const section of presentation.sections) {
    const slide = section.slides.find(s => s.id === id);
    if (slide) return slide;
  }
  return undefined;
}

// ─── Slide overrides ────────────────────────────────────────────
// Use this section to programmatically patch slides after loading
// from JSON. This is useful for dynamic content, computed values,
// or anything that can't be expressed in static JSON.
//
// Examples:
//
//   // Override a slide's title
//   Object.assign(findSlide('title'), {
//     subtitle: `Last updated: ${new Date().toLocaleDateString()}`,
//   });
//
//   // Add a dynamically generated slide
//   const introSection = presentation.sections.find(s => s.id === 'intro');
//   introSection.slides.push({
//     id: 'dynamic-slide',
//     layout: 'content',
//     title: 'Generated at build time',
//     bullets: ['This slide was added via presentation.js'],
//   });
//
// ─────────────────────────────────────────────────────────────────

export { presentation, findSlide };

/**
 * Helper: flatten all slides into a single ordered array,
 * each annotated with its section info and global index.
 */
export function getFlatSlides(pres = presentation) {
  const flat = [];
  pres.sections.forEach((section, sIdx) => {
    section.slides.forEach((slide, slideIdx) => {
      flat.push({
        ...slide,
        sectionId: section.id,
        sectionTitle: section.title,
        sectionIndex: sIdx,
        slideIndexInSection: slideIdx,
        globalIndex: flat.length,
      });
    });
  });
  return flat;
}
