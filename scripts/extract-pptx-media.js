/**
 * Extract media assets from diffusion_workshop.pptx
 * PPTX files are ZIP archives; media lives in ppt/media/
 */
import { createReadStream, mkdirSync, writeFileSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import unzipper from 'unzipper';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PPTX_PATH = join(ROOT, 'diffusion_workshop.pptx');
const MEDIA_OUT = join(ROOT, 'frontend', 'public', 'media');

const EXT_MAP = {
  '.png': 'images',
  '.jpg': 'images',
  '.jpeg': 'images',
  '.gif': 'gifs',
  '.mp4': 'videos',
  '.webm': 'videos',
  '.wmv': 'videos',
};

async function extract() {
  console.log(`Extracting media from: ${PPTX_PATH}`);
  console.log(`Output directory: ${MEDIA_OUT}`);

  // Ensure output dirs exist
  for (const subdir of new Set(Object.values(EXT_MAP))) {
    mkdirSync(join(MEDIA_OUT, subdir), { recursive: true });
  }

  const manifest = [];

  const zip = createReadStream(PPTX_PATH).pipe(unzipper.Parse({ forceStream: true }));

  for await (const entry of zip) {
    const filePath = entry.path;
    const type = entry.type; // 'Directory' or 'File'

    if (type === 'File' && filePath.startsWith('ppt/media/')) {
      const filename = filePath.split('/').pop();
      const ext = extname(filename).toLowerCase();
      const subdir = EXT_MAP[ext];

      if (subdir) {
        const outPath = join(MEDIA_OUT, subdir, filename);
        const chunks = [];
        for await (const chunk of entry) {
          chunks.push(chunk);
        }
        writeFileSync(outPath, Buffer.concat(chunks));
        const relativePath = `/media/${subdir}/${filename}`;
        manifest.push({ original: filePath, output: relativePath, size: Buffer.concat(chunks).length });
        console.log(`  Extracted: ${filePath} -> ${relativePath} (${(Buffer.concat(chunks).length / 1024).toFixed(1)} KB)`);
      } else {
        entry.autodrain();
        console.log(`  Skipped (unknown ext): ${filePath}`);
      }
    } else {
      entry.autodrain();
    }
  }

  console.log(`\nDone! Extracted ${manifest.length} media files.`);
  console.log('\nManifest:');
  manifest.forEach(m => console.log(`  ${m.output}`));
}

extract().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
