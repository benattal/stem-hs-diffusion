# Vision Workshop

Monorepo containing multiple interactive workshop presentations on computer vision / generative AI topics.

## Repository Structure

```
packages/core/           — Shared presentation framework (frontend + backend)
diffusion/               — Diffusion presentation (presentation-specific code + content)
filtering/               — Filtering presentation (presentation-specific code + content)
server/                  — Gateway server (production + dev)
```

- `packages/core/` — Shared framework: hooks, components, layouts, CSS, transitions, backend routes
- `diffusion/` — **How to Make Images with Generative AI** — Interactive slide deck
- `filtering/` — **Image Filtering** — Interactive slide deck + Jupyter notebook
- `server/gateway.mjs` — Production gateway: serves both presentations from one Express process
- `server/dev.mjs` — Dev gateway: Vite middleware mode with HMR for both presentations
- `environment.yml` — Conda environment for notebook-based workshops

## Shared Core (`packages/core/`)

### Frontend (`packages/core/frontend/`)

Shared presentation framework used by all presentations via Vite alias `@core`.

- `hooks/` — All 8 hooks (useSlideState, useKeyboardNavigation, useSwipeNavigation, useFullscreen, useSlideScaling, usePresentationSync, usePresenterMode, usePollData)
- `components/` — Shared components (Navigation, SlideOverview, ProgressBar, PresenterView, PreviewMode)
- `components/SlideRenderer.jsx` — `createSlideRenderer(layoutMap, getPresentation)` factory
- `components/layouts/` — 13 shared layout components (TitleSlide, ContentSlide, OutlineSlide, ProgressiveBuildSlide, DiscussionSlide, DiagramSlide, MediaSlide, ColabLinkSlide, PollSlide, PollResultsSlide, GenAiDemoSlide, GenAiOverviewSlide, IllustratedPointsSlide)
- `data/presentationBuilder.js` — `buildPresentation(data, slideModules)` factory
- `data/notesLoaderBuilder.js` — `buildNotesLoader(noteFiles)` factory
- `transitions/transitions.js` — Framer Motion transition variants
- `index.css` — Global styles, dark theme via CSS custom properties

### Backend (`packages/core/backend/src/`)

- `app.js` — `createApp(slidesDir)` factory for standalone Express server
- `routes/auth.js` — Presenter authentication (password verify + JWT token)
- `routes/poll.js` — Live polling with SSE streaming
- `routes/notes.js` — `createNotesRouter(slidesDir)` factory for saving presenter notes
- `store/pollStore.js` — In-memory poll state with pub/sub

### Vite Aliases

Each presentation's `vite.config.js` defines:
- `@core` → `packages/core/frontend/` (shared framework)
- `@app` → `{presentation}/frontend/src/` (presentation-specific code)

Core components use `@app/data/presentation.js`, `@app/data/notesLoader.js`, and `@app/components/SlideRenderer.jsx` to reference presentation-specific files.

## Per-Presentation Structure

Each presentation keeps only presentation-specific files:

```
{presentation}/frontend/src/
  main.jsx                    — Entry point (imports @core/index.css)
  App.jsx                     — Mode routing (normal, presenter, preview)
  components/
    Presentation.jsx          — Root component (imports hooks from @core, local SlideRenderer)
    SlideRenderer.jsx         — Thin wrapper: defines layoutMap, calls createSlideRenderer
    layouts/                  — Presentation-specific layouts only
    shared/                   — Presentation-specific shared components
  data/
    presentation.json         — Slide/section structure (unique per presentation)
    presentation.js           — Thin wrapper: glob + buildPresentation
    notesLoader.js            — Thin wrapper: glob + buildNotesLoader
  slides/{slide-id}/          — Per-slide content.json + notes.md
  public/slides/{slide-id}/   — Static assets (images, videos, GIFs)
```

### Adding a New Layout

1. If shared: create in `packages/core/frontend/components/layouts/{LayoutName}/`
2. If presentation-specific: create in `{presentation}/frontend/src/components/layouts/{LayoutName}/`
3. Register in the presentation's `SlideRenderer.jsx` layoutMap

### Slide Layouts

| Layout | Location | Use |
|--------|----------|-----|
| `title` | core | Full-screen title with optional background |
| `outline` | core | Section outline with active/completed indicators |
| `content` | core | Title + bullet points + optional media |
| `progressiveBuild` | core | Click-to-reveal steps (like PPT animations) |
| `discussion` | core | Grid of discussion prompts |
| `diagram` | core | Explanation + media + optional prompt example |
| `media` | core | 2x2 media grid |
| `colabLink` | core | Colab link button + QR code |
| `poll` | core | Live polling with real-time results |
| `pollResults` | core | Poll results bar chart |
| `genAiDemo` | core | Code + math + chat UI |
| `genAiOverview` | core | GenAI concept overview |
| `illustratedPoints` | core | Points with side illustrations |
| `diffusionSlider` | diffusion | Interactive noise slider |
| `diffusionModel` | diffusion | Model architecture visualization |
| `diffusionRandomness` | diffusion | Randomness visualization |
| `noiseDefinition` | diffusion | Noise explanation |
| `embeddingSpace` | diffusion | Interactive embedding scatter plot |
| `embeddingClusters` | diffusion | Embedding clustering visualization |
| `generationOverview` | diffusion | Generation process overview |

## Build & Run

### Gateway (both presentations)

```bash
npm run install:all   # Install all deps (both presentations)
npm run dev           # Dev server with HMR on port 3000
npm run build         # Build both frontends with base paths
npm start             # Production gateway on port 3000
```

### Standalone Dev (one presentation at a time)

```bash
npm run dev:diffusion   # localhost:5173
npm run dev:filtering   # localhost:5173
```

### Routes

- `/` — Landing page
- `/diffusion/` — Diffusion presentation
- `/diffusion/api/*` — Diffusion backend APIs
- `/filtering/` — Filtering presentation
- `/filtering/api/*` — Filtering backend APIs

### Deploy to Railway

Deploy as a single service pointing to the repo root. Railway uses `npm run build` then `npm start`.

- **Build command**: `npm run build` (builds both frontends with `/diffusion/` and `/filtering/` base paths)
- **Start command**: `npm start` (runs `server/gateway.mjs`)
- Set `PORT` env var if needed (defaults to 3000)

## Filtering Extras

- `filtering/assets/filtering_workshop.ipynb` — Jupyter notebook for the image filtering workshop
