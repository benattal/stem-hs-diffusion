# Vision Workshop

Monorepo containing multiple interactive workshop presentations on computer vision / generative AI topics.

## Repository Structure

```
packages/core/           — Shared presentation framework (frontend + backend)
diffusion/               — Diffusion presentation (presentation-specific code + content)
filtering/               — Filtering presentation (presentation-specific code + content)
face-and-hand-tracking/  — Tracking presentation (presentation-specific code + content)
server/                  — Gateway server (production + dev)
```

- `packages/core/` — Shared framework: hooks, components, layouts, CSS, transitions, backend routes
- `diffusion/` — **How to Make Images with Generative AI** — Interactive slide deck
- `filtering/` — **Image Filtering** — Interactive slide deck + Jupyter notebook
- `face-and-hand-tracking/` — **Face and Hand Tracking** — Interactive slide deck
- `server/gateway.mjs` — Production gateway: serves all presentations from one Express process
- `server/dev.mjs` — Dev gateway: Vite middleware mode with HMR for all presentations
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

#### Core layouts (shared)

| Layout | Use |
|--------|-----|
| `title` | Full-screen title with optional background |
| `outline` | Section outline with active/completed indicators |
| `content` | Title + bullet points + optional media |
| `progressiveBuild` | Click-to-reveal steps (like PPT animations) |
| `discussion` | Grid of discussion prompts |
| `diagram` | Explanation + media + optional prompt example |
| `media` | 2x2 media grid |
| `colabLink` | Colab link button + QR code |
| `poll` | Live polling with real-time results |
| `pollResults` | Poll results bar chart |
| `genAiDemo` | Code + math + chat UI |
| `genAiOverview` | GenAI concept overview |
| `illustratedPoints` | Points with side illustrations |

#### Diffusion-specific layouts

| Layout | Use |
|--------|-----|
| `diffusionSlider` | Interactive noise slider |
| `diffusionModel` | Model architecture visualization |
| `diffusionRandomness` | Randomness visualization |
| `noiseDefinition` | Noise explanation |
| `embeddingSpace` | Interactive embedding scatter plot |
| `embeddingClusters` | Embedding clustering visualization |
| `generationOverview` | Generation process overview |

#### Filtering-specific layouts

| Layout | Use |
|--------|-----|
| `convolutionAnimation` | Step-by-step convolution kernel animation |
| `filterDesigner` | Interactive kernel/filter designer |
| `imagePoll` | Image-based poll with visual options |
| `kernelPoll` | Poll for kernel/matrix value guessing |
| `kernelPollResults` | Results display for kernel polls |
| `spatialBlurDemo` | Interactive spatial blur demonstration |
| `temporalBlurDemo` | Interactive temporal blur demonstration |

#### Tracking-specific layouts

No presentation-specific layouts. Uses core layouts only: `title`, `outline`, `content`, `progressiveBuild`, `diagram`, `media`, `colabLink`.

## Build & Run

### Gateway (all presentations)

```bash
npm run install:all   # Install all deps (all presentations)
npm run dev           # Dev server with HMR on port 3000
npm run build         # Build all frontends with base paths
npm start             # Production gateway on port 3000
```

### Standalone Dev (one presentation at a time)

```bash
npm run dev:diffusion   # localhost:5173
npm run dev:filtering   # localhost:5173
npm run dev:tracking    # localhost:5173
```

### Routes

- `/` — Landing page
- `/diffusion/` — Diffusion presentation
- `/diffusion/api/*` — Diffusion backend APIs
- `/filtering/` — Filtering presentation
- `/filtering/api/*` — Filtering backend APIs
- `/tracking/` — Tracking presentation
- `/tracking/api/*` — Tracking backend APIs

### Deploy to Railway

Deploy as a single service pointing to the repo root. Railway uses `npm run build` then `npm start`.

- **Build command**: `npm run build` (builds all frontends with `/diffusion/`, `/filtering/`, and `/tracking/` base paths)
- **Start command**: `npm start` (runs `server/gateway.mjs`)
- Set `PORT` env var if needed (defaults to 3000)

### Disabling Voting

Voting on polls can be disabled project-wide via environment variables in the root `.env` file:

- `VOTING_DISABLED=true` — Backend: vote endpoint returns 403
- `VITE_VOTING_DISABLED=true` — Frontend: `submitVote` in `usePollData` becomes a no-op; hook exposes `votingDisabled` boolean for components

Both Vite configs set `envDir` to the repo root so presentations share the same `.env`. The `usePollData` hook returns `votingDisabled` so poll components can optionally reflect the disabled state in their UI.

## Presentation-Specific Extras

- `diffusion/assets/` — `diffusion_workshop.pptx`, `diffusion_workshop.ipynb`
- `diffusion/scripts/` — Media extraction scripts (`extract-pptx-media.js`, `pptx_map.cjs`)
- `filtering/assets/` — `filtering_workshop.ipynb` (Jupyter notebook for hands-on practice)
- `face-and-hand-tracking/assets/` — `face-and-hand-tracking.pptx`, extracted slides in `slides/`
- `face-and-hand-tracking/scripts/` — PPTX extraction script (`extract-pptx.cjs`)
