# Vision Workshop

Monorepo containing multiple interactive workshop presentations on computer vision / generative AI topics.

## Repository Structure

Each presentation lives in its own top-level directory as a self-contained sub-project:

- `diffusion/` — **How to Make Images with Generative AI** — Interactive slide deck (Vite + React + Express)
- `filtering/` — **Image Filtering** — Interactive slide deck (Vite + React + Express) + Jupyter notebook

Shared root files:
- `package.json` — Root orchestration: gateway server, unified build, dev mode
- `server/gateway.mjs` — Production gateway: serves both presentations from one Express process
- `server/dev.mjs` — Dev gateway: Vite middleware mode with HMR for both presentations
- `environment.yml` — Conda environment for notebook-based workshops

## Diffusion Presentation (`diffusion/`)

### Architecture

- **Monorepo**: `diffusion/package.json` orchestrates frontend + backend via `concurrently`
- **Frontend**: Vite + React 19 + Framer Motion. Presentation is data-driven from per-slide directories.
- **Backend**: Express.js (polls, health check, extensible)
- **Deployment**: Railway with nixpacks

### Project Structure

- `diffusion/frontend/src/data/presentation.json` — Defines section order and slide order (slide IDs only). Single source of truth for presentation structure.
- `diffusion/frontend/src/data/presentation.js` — Loads presentation.json and merges per-slide content at build time.
- `diffusion/frontend/src/data/notesLoader.js` — Loads presenter notes from per-slide directories at build time.
- `diffusion/frontend/src/slides/{slide-id}/` — Each slide's own directory containing:
  - `content.json` — Slide content (layout, title, bullets, media refs, etc.)
  - `notes.md` — Presenter notes (or `notes-0.md`, `notes-1.md`, etc. for build-step slides)
  - Custom JS logic can be added per slide
- `diffusion/frontend/public/slides/{slide-id}/` — Static assets (images, videos, GIFs) for each slide
- `diffusion/frontend/src/components/layouts/{LayoutName}/` — Each layout type in its own directory:
  - `{LayoutName}.jsx` — React component
  - `{LayoutName}.css` — Layout-specific styles
  - `{LayoutName}.js` — Custom logic hook (extensible)
- `diffusion/frontend/src/hooks/useSlideState.js` — Core navigation state machine (slide index, build steps, direction)
- `diffusion/frontend/src/components/Presentation.jsx` — Root presentation component with AnimatePresence
- `diffusion/frontend/src/components/SlideRenderer.jsx` — Dispatches slides to layout components based on `slide.layout`
- `diffusion/frontend/src/index.css` — Global styles, dark theme via CSS custom properties

### Slide Layouts

| Layout | Component | Use |
|--------|-----------|-----|
| `title` | TitleSlide/ | Full-screen title with optional background |
| `outline` | OutlineSlide/ | Section outline with active/completed indicators |
| `content` | ContentSlide/ | Title + bullet points + optional media |
| `progressiveBuild` | ProgressiveBuildSlide/ | Click-to-reveal steps (like PPT animations) |
| `discussion` | DiscussionSlide/ | Grid of discussion prompts |
| `diagram` | DiagramSlide/ | Explanation + media + optional prompt example |
| `media` | MediaSlide/ | 2x2 media grid |
| `colabLink` | ColabLinkSlide/ | Colab link button + QR code |

### Build & Run

```bash
cd diffusion
npm run install:all   # Install deps for frontend + backend
npm run dev           # Standalone dev (frontend:5173, backend:3000)
```

## Filtering Presentation (`filtering/`)

Same architecture as diffusion (Vite + React + Express). Also includes a Jupyter notebook.

- `filtering/assets/filtering_workshop.ipynb` — Jupyter notebook for the image filtering workshop

## Gateway (Unified Server)

Both presentations are served from a single Express process under `/diffusion/` and `/filtering/`.

- `server/gateway.mjs` — Production: serves built static files + backend API routes
- `server/dev.mjs` — Development: Vite middleware mode with HMR for both presentations

### Build & Run (Gateway)

```bash
npm run install:all   # Install all deps (both presentations)
npm run dev           # Dev server with HMR on port 3000
npm run build         # Build both frontends with base paths
npm start             # Production gateway on port 3000
```

Routes:
- `/` — Landing page
- `/diffusion/` — Diffusion presentation
- `/diffusion/api/*` — Diffusion backend APIs
- `/filtering/` — Filtering presentation
- `/filtering/api/*` — Filtering backend APIs

### Standalone Dev (one presentation at a time)

```bash
npm run dev:diffusion   # localhost:5173
npm run dev:filtering   # localhost:5173
```

### Deploy to Railway

Deploy as a single service pointing to the repo root. Railway uses `npm run build` then `npm start`.

- **Build command**: `npm run build` (builds both frontends with `/diffusion/` and `/filtering/` base paths)
- **Start command**: `npm start` (runs `server/gateway.mjs`)
- Set `PORT` env var if needed (defaults to 3000)

Alternatively, each presentation can still be deployed independently using its own `railway.toml` and `nixpacks.toml` in `{presentation}/frontend/` and `{presentation}/backend/`.
