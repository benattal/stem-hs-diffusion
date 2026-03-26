/**
 * Extract slides, text, images, videos, animations, and presenter notes
 * from face-and-hand-tracking.pptx into face-and-hand-tracking/assets/slides/
 *
 * Output structure:
 *   slides/
 *     slide-01/
 *       content.json    — slide text, layout hints, media references
 *       notes.md        — presenter notes (if any)
 *       media/          — images, videos, gifs used on this slide
 *     slide-02/
 *       ...
 *     manifest.json     — full manifest of all slides
 */

const unzipper = require('../../diffusion/node_modules/unzipper');
const fs = require('fs');
const path = require('path');

const PPTX = path.join(__dirname, '..', 'assets', 'face-and-hand-tracking.pptx');
const OUT_DIR = path.join(__dirname, '..', 'assets', 'slides');

async function main() {
  console.log(`Extracting from: ${PPTX}`);
  console.log(`Output to: ${OUT_DIR}`);

  const directory = await unzipper.Open.file(PPTX);

  // Index all files by path for quick lookup
  const fileIndex = {};
  for (const entry of directory.files) {
    fileIndex[entry.path] = entry;
  }

  // Determine slide count from files present
  const slideFiles = Object.keys(fileIndex)
    .filter(p => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });

  console.log(`Found ${slideFiles.length} slides`);

  // Read slide order from presentation.xml if available
  let slideOrder = null;
  if (fileIndex['ppt/presentation.xml']) {
    const presXml = (await fileIndex['ppt/presentation.xml'].buffer()).toString('utf-8');
    const orderRegex = /<p:sldId[^>]*r:id="([^"]+)"[^>]*\/>/g;
    const presRelsXml = fileIndex['ppt/presentation.xml.rels']
      ? (await fileIndex['ppt/presentation.xml.rels'].buffer()).toString('utf-8')
      : fileIndex['ppt/_rels/presentation.xml.rels']
        ? (await fileIndex['ppt/_rels/presentation.xml.rels'].buffer()).toString('utf-8')
        : '';

    if (presRelsXml) {
      // Build rId -> slide path mapping
      const rIdMap = {};
      const relRegex = /<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*\/?>(?:<\/Relationship>)?/g;
      let rm;
      while ((rm = relRegex.exec(presRelsXml)) !== null) {
        rIdMap[rm[1]] = rm[2];
      }

      const orderedIds = [];
      let om;
      while ((om = orderRegex.exec(presXml)) !== null) {
        orderedIds.push(om[1]);
      }

      if (orderedIds.length > 0) {
        slideOrder = orderedIds
          .map(rId => {
            const target = rIdMap[rId];
            if (target && target.includes('slide')) {
              // Normalize: slides/slide1.xml -> ppt/slides/slide1.xml
              return target.startsWith('ppt/') ? target : 'ppt/' + target;
            }
            return null;
          })
          .filter(Boolean);
      }
    }
  }

  const orderedSlideFiles = slideOrder && slideOrder.length === slideFiles.length
    ? slideOrder
    : slideFiles.map(f => f); // fallback to filesystem order

  // Read slide layout and master info for layout detection
  const manifest = [];

  for (let idx = 0; idx < orderedSlideFiles.length; idx++) {
    const slidePath = orderedSlideFiles[idx];
    const slideNum = parseInt(slidePath.match(/slide(\d+)/)[1]);
    const paddedIdx = String(idx + 1).padStart(2, '0');
    const slideDir = path.join(OUT_DIR, `slide-${paddedIdx}`);
    const mediaDir = path.join(slideDir, 'media');

    fs.mkdirSync(mediaDir, { recursive: true });

    // Read slide XML
    const slideXml = fileIndex[slidePath]
      ? (await fileIndex[slidePath].buffer()).toString('utf-8')
      : '';

    // Read slide rels
    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsXml = fileIndex[relsPath]
      ? (await fileIndex[relsPath].buffer()).toString('utf-8')
      : '';

    // Read notes
    const notesPath = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    const notesXml = fileIndex[notesPath]
      ? (await fileIndex[notesPath].buffer()).toString('utf-8')
      : '';

    // --- Extract text paragraphs ---
    const texts = extractTexts(slideXml);

    // --- Extract presenter notes ---
    const notes = notesXml ? extractTexts(notesXml) : [];
    // Filter out slide number placeholders from notes
    const filteredNotes = notes.filter(n => !/^\d+$/.test(n.trim()));

    // --- Extract media references from rels ---
    const mediaRefs = [];
    const externalLinks = [];
    const relRegex = /<Relationship[^>]*?(Id="([^"]+)")[^>]*?(Target="([^"]+)")[^>]*?(Type="([^"]+)")?[^>]*?\/?>/g;
    // Need a more robust regex that captures all attributes
    const relRegex2 = /<Relationship\s+([^>]+)\/?>/g;
    let rm;
    while ((rm = relRegex2.exec(relsXml)) !== null) {
      const attrs = rm[1];
      const id = getAttr(attrs, 'Id');
      const target = getAttr(attrs, 'Target');
      const type = getAttr(attrs, 'Type');
      const targetMode = getAttr(attrs, 'TargetMode');

      if (!target) continue;

      if (targetMode === 'External' && /^https?:\/\//.test(target)) {
        externalLinks.push({ id, url: target, type: guessLinkType(type) });
        continue;
      }

      if (target.includes('media/') || target.includes('/media/')) {
        const mediaFile = target.replace(/^\.\.\//, 'ppt/');
        mediaRefs.push({ id, path: mediaFile, filename: path.basename(mediaFile) });
      }
    }

    // --- Extract media files ---
    const extractedMedia = [];
    for (const ref of mediaRefs) {
      const entry = fileIndex[ref.path];
      if (entry) {
        const buf = await entry.buffer();
        const outPath = path.join(mediaDir, ref.filename);
        fs.writeFileSync(outPath, buf);
        const ext = path.extname(ref.filename).toLowerCase();
        const mediaType = getMediaType(ext);
        extractedMedia.push({
          filename: ref.filename,
          relId: ref.id,
          type: mediaType,
          size: buf.length,
        });
        console.log(`  slide-${paddedIdx}: ${ref.filename} (${(buf.length / 1024).toFixed(1)} KB)`);
      }
    }

    // --- Detect layout hints from slide XML ---
    const layoutHints = detectLayoutHints(slideXml, relsXml);

    // --- Extract shape/object info ---
    const shapes = extractShapes(slideXml);

    // --- Extract animations/transitions ---
    const animations = extractAnimations(slideXml);
    const transition = extractTransition(slideXml);

    // --- Build content.json ---
    const content = {
      slideIndex: idx + 1,
      originalSlideNum: slideNum,
      texts,
      shapes,
      media: extractedMedia,
      externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
      animations: animations.length > 0 ? animations : undefined,
      transition: transition || undefined,
      layoutHints,
    };

    fs.writeFileSync(
      path.join(slideDir, 'content.json'),
      JSON.stringify(content, null, 2)
    );

    // --- Write notes.md ---
    if (filteredNotes.length > 0) {
      fs.writeFileSync(
        path.join(slideDir, 'notes.md'),
        filteredNotes.join('\n\n') + '\n'
      );
    }

    // Clean up empty media dir
    if (extractedMedia.length === 0) {
      try { fs.rmdirSync(mediaDir); } catch {}
    }

    manifest.push({
      slideDir: `slide-${paddedIdx}`,
      slideIndex: idx + 1,
      originalSlideNum: slideNum,
      title: texts[0] || null,
      mediaCount: extractedMedia.length,
      hasNotes: filteredNotes.length > 0,
      hasAnimations: animations.length > 0,
    });
  }

  // Write manifest
  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nDone! Extracted ${manifest.length} slides.`);
  console.log(`\nManifest:`);
  manifest.forEach(s => {
    const parts = [s.slideDir];
    if (s.title) parts.push(`"${s.title}"`);
    if (s.mediaCount) parts.push(`${s.mediaCount} media`);
    if (s.hasNotes) parts.push('has notes');
    if (s.hasAnimations) parts.push('has animations');
    console.log(`  ${parts.join(' — ')}`);
  });
}

// --- Helper functions ---

function getAttr(attrStr, name) {
  const m = new RegExp(`${name}="([^"]*)"`, 'i').exec(attrStr);
  return m ? m[1] : null;
}

function extractTexts(xml) {
  const texts = [];
  const paraRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g;
  let pm;
  while ((pm = paraRegex.exec(xml)) !== null) {
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
  return texts;
}

function extractShapes(xml) {
  const shapes = [];
  // Match shape trees with names
  const spRegex = /<p:sp\b[^>]*>([\s\S]*?)<\/p:sp>/g;
  let sm;
  while ((sm = spRegex.exec(xml)) !== null) {
    const spContent = sm[1];
    const nameMatch = /<p:cNvPr[^>]*name="([^"]*)"/.exec(spContent) ||
                      /<cNvPr[^>]*name="([^"]*)"/.exec(spContent);
    const name = nameMatch ? nameMatch[1] : 'unnamed';

    // Check for placeholder type
    const phMatch = /<p:ph[^>]*type="([^"]*)"/.exec(spContent);
    const phType = phMatch ? phMatch[1] : null;

    // Get text content
    const texts = extractTexts(spContent);

    if (texts.length > 0 || phType) {
      shapes.push({
        name,
        placeholderType: phType || undefined,
        texts: texts.length > 0 ? texts : undefined,
      });
    }
  }

  // Match pictures
  const picRegex = /<p:pic\b[^>]*>([\s\S]*?)<\/p:pic>/g;
  let pm;
  while ((pm = picRegex.exec(xml)) !== null) {
    const picContent = pm[1];
    const nameMatch = /<p:cNvPr[^>]*name="([^"]*)"/.exec(picContent) ||
                      /<cNvPr[^>]*name="([^"]*)"/.exec(picContent);
    const name = nameMatch ? nameMatch[1] : 'unnamed-pic';

    // Get the relationship reference
    const embedMatch = /r:embed="([^"]*)"/.exec(picContent);
    const linkMatch = /r:link="([^"]*)"/.exec(picContent);

    shapes.push({
      name,
      type: 'picture',
      embedRef: embedMatch ? embedMatch[1] : undefined,
      linkRef: linkMatch ? linkMatch[1] : undefined,
    });
  }

  return shapes;
}

function extractAnimations(xml) {
  const animations = [];

  // Check for animation timing
  const animRegex = /<p:anim\b[^>]*>([\s\S]*?)<\/p:anim>/g;
  let am;
  while ((am = animRegex.exec(xml)) !== null) {
    animations.push({ type: 'anim', raw: 'property animation' });
  }

  // Check for entrance/exit/emphasis effects
  const animEffectRegex = /<p:animEffect\b[^>]*transition="([^"]*)"[^>]*filter="([^"]*)"[^>]*>/g;
  while ((am = animEffectRegex.exec(xml)) !== null) {
    animations.push({ type: 'animEffect', transition: am[1], filter: am[2] });
  }

  // Check for motion paths
  const animMotionRegex = /<p:animMotion\b/g;
  while ((am = animMotionRegex.exec(xml)) !== null) {
    animations.push({ type: 'motionPath' });
  }

  // Check for build sequences (click-to-advance)
  const seqRegex = /<p:seq\b[^>]*>([\s\S]*?)<\/p:seq>/g;
  while ((am = seqRegex.exec(xml)) !== null) {
    // Count child nodes to estimate number of build steps
    const nodeRegex = /<p:cTn\b/g;
    let count = 0;
    let nm;
    while ((nm = nodeRegex.exec(am[1])) !== null) count++;
    if (count > 0) {
      animations.push({ type: 'buildSequence', steps: count });
    }
  }

  // Check for set effects (appear/disappear)
  const setRegex = /<p:set\b[^>]*>([\s\S]*?)<\/p:set>/g;
  while ((am = setRegex.exec(xml)) !== null) {
    animations.push({ type: 'set', raw: 'visibility change' });
  }

  return animations;
}

function extractTransition(xml) {
  // Look for slide transition
  const transRegex = /<p:transition\b([^>]*)>([\s\S]*?)<\/p:transition>/;
  const match = transRegex.exec(xml);
  if (!match) return null;

  const attrs = match[1];
  const content = match[2];

  const speed = getAttr(attrs, 'spd') || 'med';
  const advClick = getAttr(attrs, 'advClick');
  const advTm = getAttr(attrs, 'advTm');

  // Try to identify transition type from child element
  const typeMatch = /<p:(\w+)\b/.exec(content);
  const transType = typeMatch ? typeMatch[1] : 'unknown';

  return {
    type: transType,
    speed,
    advanceOnClick: advClick !== 'false' && advClick !== '0',
    advanceAfterMs: advTm ? parseInt(advTm) : undefined,
  };
}

function detectLayoutHints(slideXml, relsXml) {
  const hints = {};

  // Check for title placeholder
  if (/<p:ph[^>]*type="title"/.test(slideXml) || /<p:ph[^>]*type="ctrTitle"/.test(slideXml)) {
    hints.hasTitle = true;
  }
  if (/<p:ph[^>]*type="ctrTitle"/.test(slideXml)) {
    hints.centerTitle = true;
  }

  // Check for body/content
  if (/<p:ph[^>]*type="body"/.test(slideXml) || /<p:ph[^>]*idx="1"/.test(slideXml)) {
    hints.hasBody = true;
  }

  // Check for subtitle
  if (/<p:ph[^>]*type="subTitle"/.test(slideXml)) {
    hints.hasSubtitle = true;
  }

  // Check for images/pictures
  if (/<p:pic\b/.test(slideXml)) {
    hints.hasPictures = true;
  }

  // Check for tables
  if (/<a:tbl\b/.test(slideXml)) {
    hints.hasTable = true;
  }

  // Check for charts
  if (/<c:chart/.test(slideXml) || /chart/.test(relsXml)) {
    hints.hasChart = true;
  }

  // Check for grouped shapes
  if (/<p:grpSp\b/.test(slideXml)) {
    hints.hasGroups = true;
  }

  // Check for video
  if (/<p:video\b/.test(slideXml) || /<a:videoFile/.test(slideXml)) {
    hints.hasVideo = true;
  }

  return hints;
}

function getMediaType(ext) {
  const map = {
    '.png': 'image', '.jpg': 'image', '.jpeg': 'image',
    '.gif': 'gif', '.svg': 'image',
    '.mp4': 'video', '.webm': 'video', '.wmv': 'video', '.avi': 'video',
    '.wav': 'audio', '.mp3': 'audio', '.m4a': 'audio',
    '.emf': 'vector', '.wmf': 'vector',
  };
  return map[ext] || 'other';
}

function guessLinkType(relType) {
  if (!relType) return 'unknown';
  if (relType.includes('video')) return 'video';
  if (relType.includes('image')) return 'image';
  if (relType.includes('hyperlink')) return 'hyperlink';
  return 'other';
}

main().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
