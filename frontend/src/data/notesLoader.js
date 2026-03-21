import presenterNotes from './presenterNotes.json';

// Eagerly import all .md files from data/notes/ as raw text at build time
const noteFiles = import.meta.glob('./notes/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// Build a filename → content map
const fileContents = {};
for (const [path, content] of Object.entries(noteFiles)) {
  const filename = path.split('/').pop();
  fileContents[filename] = content;
}

function resolve(filename) {
  return fileContents[filename] ?? '';
}

/**
 * Get the presenter notes for a slide, resolving file references.
 * For progressive-build slides, pass the current buildStep index.
 */
export function getNotesForSlide(slideId, buildStep = 0) {
  const entry = presenterNotes[slideId];
  if (!entry) return '';

  // Build-step slides with per-step files
  if (entry.buildStepFiles) {
    return resolve(entry.buildStepFiles[buildStep] ?? entry.buildStepFiles[0]);
  }

  // Single file reference
  if (entry.file) {
    return resolve(entry.file);
  }

  // Inline fallback (notes/buildStepNotes still work if someone prefers inline)
  if (entry.buildStepNotes) {
    return entry.buildStepNotes[buildStep] ?? entry.buildStepNotes[0] ?? '';
  }
  return entry.notes ?? '';
}
