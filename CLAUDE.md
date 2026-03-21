# Vision Workshop

Interactive presentation website for a diffusion/generative AI workshop.

## Architecture

- **Monorepo**: Root package.json orchestrates frontend + backend via `concurrently`
- **Frontend**: Vite + React 19 + Framer Motion. Presentation is data-driven from `src/data/presentation.js`
- **Backend**: Express.js (minimal — health check only, extensible for future features)
- **Deployment**: Railway with nixpacks

## Key Files

- `frontend/src/data/presentation.js` — All slide content defined declaratively. This is the single source of truth for what appears in the presentation.
- `frontend/src/hooks/useSlideState.js` — Core navigation state machine (slide index, build steps, direction)
- `frontend/src/components/Presentation.jsx` — Root presentation component with AnimatePresence
- `frontend/src/components/SlideRenderer.jsx` — Dispatches slides to layout components based on `slide.layout`
- `frontend/src/components/layouts/` — One component per layout type (TitleSlide, ProgressiveBuildSlide, etc.)
- `frontend/src/index.css` — All styles, dark theme via CSS custom properties

## Slide Layouts

| Layout | Component | Use |
|--------|-----------|-----|
| `title` | TitleSlide.jsx | Full-screen title with optional background |
| `outline` | OutlineSlide.jsx | Section outline with active/completed indicators |
| `content` | ContentSlide.jsx | Title + bullet points + optional media |
| `progressiveBuild` | ProgressiveBuildSlide.jsx | Click-to-reveal steps (like PPT animations) |
| `discussion` | DiscussionSlide.jsx | Grid of discussion prompts |
| `diagram` | DiagramSlide.jsx | Explanation + media + optional prompt example |
| `media` | MediaSlide.jsx | 2x2 media grid |
| `colabLink` | ColabLinkSlide.jsx | Colab link button + QR code |

## Build & Run

```bash
npm run install:all   # Install deps for frontend + backend
npm run dev           # Start both (frontend:5173, backend:3000)
npm run build         # Production build
```
