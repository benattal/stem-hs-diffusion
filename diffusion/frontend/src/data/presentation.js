import presentationData from './presentation.json';
import { buildPresentation } from '@core/data/presentationBuilder.js';

const slideModules = import.meta.glob('../slides/*/content.json', {
  eager: true,
  import: 'default',
});

export const { presentation, findSlide, getFlatSlides } = buildPresentation(presentationData, slideModules);
