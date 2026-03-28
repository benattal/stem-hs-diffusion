import { buildNotesLoader } from '@core/data/notesLoaderBuilder.js';

const noteFiles = import.meta.glob('../slides/**/notes*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const { getNotesForSlide } = buildNotesLoader(noteFiles);
