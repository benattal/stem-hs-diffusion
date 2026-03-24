const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

const PPTX = path.join(__dirname, '../assets', 'diffusion_workshop.pptx');

async function main() {
  // Step 1: Read all relevant files from the PPTX into memory
  const files = {};
  const directory = await unzipper.Open.file(PPTX);

  for (const entry of directory.files) {
    const p = entry.path;
    if (
      p.startsWith('ppt/slides/slide') && p.endsWith('.xml') ||
      p.startsWith('ppt/slides/_rels/slide') && p.endsWith('.xml.rels') ||
      p === 'ppt/presentation.xml'
    ) {
      const buf = await entry.buffer();
      files[p] = buf.toString('utf-8');
    }
  }

  const result = {};

  for (let i = 1; i <= 21; i++) {
    const slideKey = `slide${i}`;
    const slideXml = files[`ppt/slides/slide${i}.xml`] || '';
    const relsXml = files[`ppt/slides/_rels/slide${i}.xml.rels`] || '';

    // --- Extract media from .rels ---
    const media = [];
    // Match Relationship elements whose Target points to ../media/
    const relRegex = /<Relationship[^>]*Target="([^"]*)"[^>]*>/g;
    let m;
    while ((m = relRegex.exec(relsXml)) !== null) {
      const target = m[1];
      if (target.includes('/media/') || target.includes('media/')) {
        // Normalize: ../media/image1.png -> ppt/media/image1.png
        const mediaFile = target.replace(/^\.\.\//, 'ppt/');
        media.push(mediaFile);
      }
    }
    // Also check for external video links (r:link type relationships)
    const linkRegex = /<Relationship[^>]*Target="(https?:\/\/[^"]*)"[^>]*>/g;
    while ((m = linkRegex.exec(relsXml)) !== null) {
      media.push(m[1]);
    }

    // --- Extract text from slide XML ---
    const texts = [];
    // Get all <a:t> text nodes
    const textRegex = /<a:t>([^<]*)<\/a:t>/g;
    let currentTexts = [];
    let lastIndex = 0;

    // We want to group text by paragraph (<a:p>)
    // Split by paragraphs
    const paraRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
    let pm;
    while ((pm = paraRegex.exec(slideXml)) !== null) {
      const paraContent = pm[1];
      const lineTexts = [];
      const tRegex = /<a:t>([^<]*)<\/a:t>/g;
      let tm;
      while ((tm = tRegex.exec(paraContent)) !== null) {
        lineTexts.push(tm[1]);
      }
      if (lineTexts.length > 0) {
        const line = lineTexts.join('').trim();
        if (line) {
          texts.push(line);
        }
      }
    }

    result[slideKey] = { texts, media };
  }

  console.log(JSON.stringify(result, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
