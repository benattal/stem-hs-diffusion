import express from 'express';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Create a notes router for a specific presentation's slides directory.
 * @param {string} slidesDir - Absolute path to the frontend/src/slides directory
 */
export default function createNotesRouter(slidesDir) {
  const router = express.Router();

  router.put('/:slideId', async (req, res) => {
    const { slideId } = req.params;
    const { buildStep, content } = req.body;

    if (typeof content !== 'string') {
      return res.status(400).json({ error: 'content must be a string' });
    }

    // Sanitize slideId to prevent path traversal
    if (!/^[a-z0-9-]+$/.test(slideId)) {
      return res.status(400).json({ error: 'Invalid slide ID' });
    }

    const slideDir = path.join(slidesDir, slideId);

    // Create slide directory if it doesn't exist
    if (!existsSync(slideDir)) {
      await mkdir(slideDir, { recursive: true });
    }

    // Determine filename: use numbered scheme (notes-0.md) if the slide already
    // has numbered notes files, otherwise use notes.md for build step 0
    let filename;
    if (buildStep > 0) {
      filename = `notes-${buildStep}.md`;
    } else if (existsSync(path.join(slideDir, 'notes-0.md'))) {
      filename = 'notes-0.md';
    } else {
      filename = 'notes.md';
    }
    const filePath = path.join(slideDir, filename);

    try {
      await writeFile(filePath, content, 'utf-8');
      res.json({ ok: true, path: `${slideId}/${filename}` });
    } catch (err) {
      console.error('Failed to write notes:', err);
      res.status(500).json({ error: 'Failed to write file' });
    }
  });

  return router;
}
