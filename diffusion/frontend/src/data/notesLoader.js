// Eagerly import all notes .md files from slide directories at build time
const noteFiles = import.meta.glob('../slides/**/notes*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

// Build a lookup: { slideId: { "notes.md": content, "notes-0.md": content, ... } }
const notesMap = {};
for (const [path, content] of Object.entries(noteFiles)) {
  // path looks like "../slides/{slide-id}/notes.md" or "../slides/{slide-id}/notes-0.md"
  const parts = path.split('/');
  const filename = parts.pop();
  const slideId = parts.pop();
  if (!notesMap[slideId]) notesMap[slideId] = {};
  notesMap[slideId][filename] = content;
}

/**
 * Get the presenter notes for a slide, resolving file references.
 * For progressive-build slides, pass the current buildStep index.
 */
export function getNotesForSlide(slideId, buildStep = 0) {
  const entry = notesMap[slideId];
  if (!entry) return '';

  // Build-step slides with per-step notes files (notes-0.md, notes-1.md, ...)
  const stepFile = `notes-${buildStep}.md`;
  if (entry[stepFile]) {
    return entry[stepFile];
  }

  // Single notes file
  if (entry['notes.md']) {
    return entry['notes.md'];
  }

  return '';
}
