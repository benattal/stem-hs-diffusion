# Vision Workshop

Monorepo containing multiple interactive workshop presentations on computer vision and generative AI topics.

## Presentations

| Directory | Topic | Format |
|-----------|-------|--------|
| `filtering/` | Image Filtering | Interactive slide deck + Jupyter notebook |
| `diffusion/` | How to Make Images with Generative AI | Interactive slide deck |

## Prerequisites

- Node.js >= 20
- [Conda](https://docs.conda.io/en/latest/) or [Mamba](https://mamba.readthedocs.io/) (for notebook workshops)

## Quick Start

```bash
npm run install:all   # Install all deps (both presentations)
npm run dev           # Dev server with HMR on http://localhost:3000
```

This starts a single server with both presentations:
- http://localhost:3000/ — Landing page
- http://localhost:3000/filtering/ — Filtering presentation
- http://localhost:3000/diffusion/ — Diffusion presentation

### Navigation

| Key | Action |
|-----|--------|
| Arrow keys / Space / Enter | Next/previous slide |
| Click | Advance slide |
| O | Toggle slide overview |
| F | Toggle fullscreen |
| P | Open presenter notes (second window) |
| Escape | Close overview |
| Swipe | Mobile touch navigation |

### Presenter Notes

Press **P** (or click the clipboard button in the top-right toolbar) to open a presenter notes window. Drag it to a second monitor while presenting in fullscreen on the main display. Navigation from either window stays in sync.

The presenter window shows:
- Current slide title and section
- Markdown-rendered notes for the current slide/build step
- A preview of the next slide
- An elapsed-time timer
- Prev/Next buttons (keyboard nav also works from this window)

---

## Shared Core (`packages/core/`)

Shared presentation framework used by all presentations via Vite alias `@core`.

- **Hooks** (8): useSlideState, useKeyboardNavigation, useSwipeNavigation, useFullscreen, useSlideScaling, usePresentationSync, usePresenterMode, usePollData
- **Components**: Navigation, SlideOverview, ProgressBar, PresenterView, PreviewMode, SlideRenderer factory
- **Layouts** (13): TitleSlide, ContentSlide, OutlineSlide, ProgressiveBuildSlide, DiscussionSlide, DiagramSlide, MediaSlide, ColabLinkSlide, PollSlide, PollResultsSlide, GenAiDemoSlide, GenAiOverviewSlide, IllustratedPointsSlide
- **Backend**: Express server factory with auth (JWT), live polling (SSE), and presenter notes routes

---

## Diffusion Presentation (`diffusion/`)

Interactive presentation website. Students visit the site and click through slides and animations.

### Standalone Development

```bash
npm run dev:diffusion   # frontend:5173, backend:3000
```

### Project Structure

```
diffusion/
├── assets/
│   ├── diffusion_workshop.pptx
│   └── diffusion_workshop.ipynb
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── presentation.json  # Section/slide ordering (IDs only)
│   │   │   ├── presentation.js    # Merges slide content at build time
│   │   │   └── notesLoader.js     # Loads notes from slide directories
│   │   ├── slides/                # One directory per slide
│   │   │   └── {slide-id}/
│   │   │       ├── content.json   # Slide content (layout, data, media refs)
│   │   │       ├── notes.md       # Presenter notes (Markdown)
│   │   │       └── notes-N.md     # Per-build-step notes (for progressive builds)
│   │   └── components/
│   │       ├── Presentation.jsx   # Main presentation view
│   │       ├── SlideRenderer.jsx  # Dispatches slides to layout components
│   │       ├── shared/            # DiffusionCycleBackground, DiffusionSequence
│   │       └── layouts/           # Presentation-specific layouts
│   └── public/
│       └── slides/                # Static assets per slide
│           └── {slide-id}/        # Images, videos, GIFs
├── backend/               # Express API server
└── scripts/               # Media extraction from PPTX
```

### Custom Layouts

| Layout | Description |
|--------|-------------|
| `diffusionSlider` | Interactive noise slider |
| `diffusionModel` | Model architecture visualization |
| `diffusionRandomness` | Randomness visualization |
| `noiseDefinition` | Noise explanation |
| `embeddingSpace` | Interactive embedding scatter plot |
| `embeddingClusters` | Embedding clustering visualization |
| `generationOverview` | Generation process overview |

### Extending the Diffusion Presentation

#### Adding a slide

1. Create a new directory under `diffusion/frontend/src/slides/` with a unique slide ID:

```
diffusion/frontend/src/slides/my-new-slide/
├── content.json
└── notes.md
```

2. Define the slide content in `content.json`:

```json
{
  "layout": "content",
  "sectionLabel": "Section Name",
  "title": "Slide Title",
  "bullets": ["Point one", "Point two"]
}
```

3. Add presenter notes in `notes.md` (supports full Markdown).

4. Add the slide ID to the appropriate section in `diffusion/frontend/src/data/presentation.json`:

```json
{
  "id": "my-section",
  "title": "Section Title",
  "slides": ["existing-slide", "my-new-slide"]
}
```

5. If the slide has media assets, place them in `diffusion/frontend/public/slides/my-new-slide/` and reference them as `/slides/my-new-slide/filename.png` in `content.json`.

#### Adding a section

Add a section object to the `sections` array in `presentation.json`:

```json
{
  "id": "new-section",
  "title": "New Section Title",
  "slides": ["slide-id-1", "slide-id-2"]
}
```

Outline slides (`layout: "outline"`) automatically render all sections; set `activeSection` to the current section's `id` to highlight it.

#### For progressive-build slides

Use per-step notes files: `notes-0.md`, `notes-1.md`, `notes-2.md`, etc.

#### Available shared layouts

| Layout | Required fields | Description |
|--------|----------------|-------------|
| `title` | `title` | Full-screen title. Optional: `subtitle`, `background` (image path) |
| `outline` | `activeSection` | Section outline with active/completed indicators |
| `content` | `title`, `bullets` | Title + bullet list. Optional: `media` array |
| `progressiveBuild` | `title`, `buildSteps` | Click-to-reveal steps. Each step: `{ label, description, media }`. Optional: `expandable` |
| `discussion` | `title`, `prompts` | Grid of discussion prompt strings |
| `diagram` | `title`, `description`, `media` | Explanation + media. Optional: `example` with `positive`/`negative` prompts |
| `media` | `title`, `media` | 2x2 media grid (4 items) |
| `colabLink` | `title`, `description`, `colabUrl` | Colab button + QR code. Optional: `note` |

Media objects are `{ type: "image" | "video" | "gif", src: "/slides/{slide-id}/file.png" }`.

#### Overriding slides in JS

For dynamic content that can't live in static JSON, use the "Slide overrides" section in `presentation.js`:

```js
import { findSlide } from './presentation.js';

Object.assign(findSlide('title'), {
  subtitle: `Last updated: ${new Date().toLocaleDateString()}`,
});
```

#### Adding media

1. Place images, GIFs, or videos in `diffusion/frontend/public/slides/{slide-id}/`.
2. Reference them in the slide's `content.json` as `/slides/{slide-id}/filename.png`.

---

## Filtering Presentation (`filtering/`)

Interactive slide deck (same architecture as diffusion) plus a Jupyter notebook for hands-on practice. Covers spatial/temporal blur and edge detection with interactive demos.

### Standalone Development

```bash
npm run dev:filtering   # frontend:5173, backend:3000
```

### Project Structure

```
filtering/
├── assets/
│   └── filtering_workshop.ipynb
├── frontend/
│   ├── src/
│   │   ├── data/
│   │   │   ├── presentation.json  # Section/slide ordering
│   │   │   ├── presentation.js    # Merges slide content at build time
│   │   │   └── notesLoader.js     # Loads notes from slide directories
│   │   ├── slides/                # ~35 slide directories
│   │   │   └── {slide-id}/
│   │   │       ├── content.json
│   │   │       └── notes.md
│   │   └── components/
│   │       ├── Presentation.jsx
│   │       ├── SlideRenderer.jsx
│   │       └── layouts/           # Presentation-specific layouts
│   └── public/
│       └── slides/                # Static assets per slide
├── backend/                       # Express API server
└── environment.yml                # Conda env (at repo root)
```

### Custom Layouts

| Layout | Description |
|--------|-------------|
| `convolutionAnimation` | Step-by-step convolution kernel animation |
| `filterDesigner` | Interactive kernel/filter designer tool |
| `imagePoll` | Image-based poll with visual options |
| `kernelPoll` | Poll for kernel/matrix value guessing |
| `kernelPollResults` | Results display for kernel polls |
| `spatialBlurDemo` | Interactive spatial blur demonstration |
| `temporalBlurDemo` | Interactive temporal blur demonstration |

### Jupyter Notebook

```bash
conda env create -f environment.yml
conda activate vision-workshop
jupyter notebook filtering/assets/filtering_workshop.ipynb
```

---

## Production Build & Deploy

### Local Production

```bash
npm run build   # Build both frontends with /diffusion/ and /filtering/ base paths
npm start       # Start gateway on port 3000
```

### Deploy to Railway

Deploy as a **single service** pointing to the repo root:

| Setting | Value |
|---------|-------|
| **Root directory** | `/` (repo root) |
| **Build command** | `npm run install:all && npm run build` |
| **Start command** | `npm start` |

The gateway server (`server/gateway.mjs`) serves both presentations and their APIs from one process:
- `https://<your-app>.railway.app/` — Landing page
- `https://<your-app>.railway.app/filtering/` — Filtering presentation
- `https://<your-app>.railway.app/diffusion/` — Diffusion presentation

Set the `PORT` environment variable if Railway requires a specific port (the gateway reads `process.env.PORT`, defaulting to 3000).

#### Alternative: Deploy presentations independently

Each presentation can also be deployed as separate Railway services using the `railway.toml` and `nixpacks.toml` files in `{presentation}/frontend/` and `{presentation}/backend/`.
