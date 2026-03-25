// Prefix absolute asset paths (/slides/...) with the app's base URL
// so they resolve correctly when served under a sub-path.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

function prefixAssetPaths(obj) {
  if (typeof obj === 'string') {
    return obj.startsWith('/slides/') ? base + obj : obj;
  }
  if (Array.isArray(obj)) return obj.map(prefixAssetPaths);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = prefixAssetPaths(v);
    return out;
  }
  return obj;
}

/**
 * Build a presentation object from raw JSON data and eagerly-imported slide modules.
 */
export function buildPresentation(presentationData, slideModules) {
  // Build a slideId → content map
  const slideContent = {};
  for (const [path, content] of Object.entries(slideModules)) {
    // path looks like "../slides/{slide-id}/content.json"
    const slideId = path.split('/').at(-2);
    slideContent[slideId] = content;
  }

  // Deep-clone the JSON data and resolve slide references.
  const presentation = JSON.parse(JSON.stringify(presentationData));

  for (const section of presentation.sections) {
    section.slides = section.slides.map((slideId) => {
      const content = slideContent[slideId];
      if (!content) {
        console.warn(`No content.json found for slide "${slideId}"`);
        return { id: slideId, layout: 'content', title: `Missing: ${slideId}` };
      }
      return prefixAssetPaths({ id: slideId, ...JSON.parse(JSON.stringify(content)) });
    });
  }

  function findSlide(id) {
    for (const section of presentation.sections) {
      const slide = section.slides.find(s => s.id === id);
      if (slide) return slide;
    }
    return undefined;
  }

  function getFlatSlides(pres = presentation) {
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

  return { presentation, findSlide, getFlatSlides };
}
