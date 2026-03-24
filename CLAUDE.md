# Vision Workshop

Monorepo containing multiple interactive workshop presentations on computer vision / generative AI topics.

## Repository Structure

Each presentation lives in its own top-level directory as a self-contained sub-project:

- `diffusion/` — **How to Make Images with Generative AI** — Interactive slide deck (Vite + React + Express)
- `filtering/` — **Image Filtering** — Jupyter notebook-based workshop

Shared root files:
- `environment.yml` — Conda environment for notebook-based workshops
- `package.json` — Root orchestration (currently wires up `diffusion/`)

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
npm run dev           # Start both (frontend:5173, backend:3000)
npm run build         # Production build
```

## Filtering Workshop (`filtering/`)

- `filtering/assets/STEM_Workshop_Image_Filtering.ipynb` — Jupyter notebook for the image filtering workshop

```bash
conda env create -f environment.yml
conda activate vision-workshop
jupyter notebook filtering/assets/STEM_Workshop_Image_Filtering.ipynb
```
