import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRouter, { requirePresenter } from '../packages/core/backend/src/routes/auth.js';
import pollRouter from '../packages/core/backend/src/routes/poll.js';
import createNotesRouter from '../packages/core/backend/src/routes/notes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const app = express();

// ── Shared middleware ──────────────────────────────────────────
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Notes routers (presentation-specific slides directories) ──
const diffusionNotesRouter = createNotesRouter(join(root, 'diffusion/frontend/src/slides'));
const filteringNotesRouter = createNotesRouter(join(root, 'filtering/frontend/src/slides'));
const trackingNotesRouter = createNotesRouter(join(root, 'face-and-hand-tracking/frontend/src/slides'));

// Diffusion API
app.use('/diffusion/api/auth', authRouter);
app.use('/diffusion/api/poll', pollRouter);
app.use('/diffusion/api/notes', requirePresenter, diffusionNotesRouter);
app.get('/diffusion/health', (req, res) => res.json({ status: 'ok', presentation: 'diffusion', timestamp: new Date().toISOString() }));

// Filtering API
app.use('/filtering/api/auth', authRouter);
app.use('/filtering/api/poll', pollRouter);
app.use('/filtering/api/notes', requirePresenter, filteringNotesRouter);
app.get('/filtering/health', (req, res) => res.json({ status: 'ok', presentation: 'filtering', timestamp: new Date().toISOString() }));

// Tracking API
app.use('/tracking/api/auth', authRouter);
app.use('/tracking/api/poll', pollRouter);
app.use('/tracking/api/notes', requirePresenter, trackingNotesRouter);
app.get('/tracking/health', (req, res) => res.json({ status: 'ok', presentation: 'tracking', timestamp: new Date().toISOString() }));

// ── Serve each frontend's built static files ──────────────────

app.use('/diffusion', express.static(join(root, 'diffusion/frontend/dist')));
app.use('/filtering', express.static(join(root, 'filtering/frontend/dist')));
app.use('/tracking', express.static(join(root, 'face-and-hand-tracking/frontend/dist')));

// SPA fallback: serve index.html for any non-file route under each prefix
app.get('/diffusion/*', (req, res) => {
  res.sendFile(join(root, 'diffusion/frontend/dist/index.html'));
});
app.get('/filtering/*', (req, res) => {
  res.sendFile(join(root, 'filtering/frontend/dist/index.html'));
});
app.get('/tracking/*', (req, res) => {
  res.sendFile(join(root, 'face-and-hand-tracking/frontend/dist/index.html'));
});

// ── Landing page ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vision Workshop</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0a0a0f;
      color: #e8e8f0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #e8e8f0 0%, #00d2ff 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #9898b0; margin-bottom: 2.5rem; }
    .cards {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    a.card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 280px;
      padding: 2.5rem 2rem;
      background: #1a1a2e;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      text-decoration: none;
      color: #e8e8f0;
      transition: all 0.2s ease;
    }
    a.card:hover {
      border-color: #6c63ff;
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(108, 99, 255, 0.2);
    }
    .card-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .card h2 { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; text-align: center; }
    .card p { font-size: 0.85rem; color: #9898b0; margin-bottom: 0; text-align: center; }
  </style>
</head>
<body>
  <h1>Vision Workshop</h1>
  <p>Choose a presentation</p>
  <div class="cards">
    <a class="card" href="/filtering/">
      <div class="card-icon">&#x1f50d;</div>
      <h2>Image Filtering</h2>
      <p>Blurring, filtering, &amp edge detection</p>
    </a>
    <a class="card" href="/tracking/">
      <div class="card-icon">&#x1f91a;</div>
      <h2>Face &amp; Hand Tracking</h2>
      <p>Computer vision for interactive digital humans</p>
    </a>
    <a class="card" href="/diffusion/">
      <div class="card-icon">&#x1f3a8;</div>
      <h2>Generative AI &amp; Diffusion</h2>
      <p>How to make images with generative AI</p>
    </a>
  </div>
</body>
</html>`);
});

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    presentations: ['diffusion', 'filtering', 'tracking'],
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Vision Workshop Gateway');
  console.log('='.repeat(60));
  console.log(`Server running on port ${PORT}`);
  console.log(`  http://localhost:${PORT}/            Landing page`);
  console.log(`  http://localhost:${PORT}/diffusion/   Diffusion presentation`);
  console.log(`  http://localhost:${PORT}/filtering/   Filtering presentation`);
  console.log(`  http://localhost:${PORT}/tracking/    Tracking presentation`);
  console.log('='.repeat(60));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
