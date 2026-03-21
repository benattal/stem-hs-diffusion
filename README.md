# Vision Workshop: How to Make Images with Generative AI

Interactive presentation website for the diffusion workshop. Students can visit the site and click through slides and animations.

## Prerequisites

- [Conda](https://docs.conda.io/en/latest/) or [Mamba](https://mamba.readthedocs.io/)
- Node.js >= 20

## Setup

```bash
# Create conda environment
conda env create -f environment.yml
conda activate vision-workshop

# Install all dependencies (frontend + backend)
npm run install:all
```

## Development

```bash
# Start both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Navigation

| Key | Action |
|-----|--------|
| Arrow keys / Space / Enter | Next/previous slide |
| Click | Advance slide |
| O | Toggle slide overview |
| F | Toggle fullscreen |
| P | Open presenter notes (second window) |
| Escape | Close overview |
| Swipe | Mobile touch navigation |

## Presenter Notes

Press **P** (or click the clipboard button in the top-right toolbar) to open a presenter notes window. Drag it to a second monitor while presenting in fullscreen on the main display. Navigation from either window stays in sync.

The presenter window shows:
- Current slide title and section
- Markdown-rendered notes for the current slide/build step
- A preview of the next slide
- An elapsed-time timer
- Prev/Next buttons (keyboard nav also works from this window)

## Production Build

```bash
npm run build
npm start
```

## Deploy to Railway

Each service (frontend/backend) has its own `railway.toml` and `nixpacks.toml`. Deploy as two separate Railway services pointing to the `frontend/` and `backend/` directories respectively.

## Project Structure

```
vision_workshop/
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
│   │   ├── components/
│   │   │   ├── Presentation.jsx   # Main presentation view
│   │   │   ├── PresenterView.jsx  # Second-monitor presenter display
│   │   │   ├── SlideRenderer.jsx  # Dispatches slides to layout components
│   │   │   └── layouts/           # One directory per layout type
│   │   │       └── {LayoutName}/
│   │   │           ├── {LayoutName}.jsx  # React component
│   │   │           ├── {LayoutName}.css  # Layout styles
│   │   │           └── {LayoutName}.js   # Custom logic hook
│   │   ├── hooks/
│   │   │   ├── useSlideState.js   # Core navigation state machine
│   │   │   ├── useKeyboardNavigation.js
│   │   │   ├── useSwipeNavigation.js
│   │   │   ├── useFullscreen.js
│   │   │   └── usePresentationSync.js  # BroadcastChannel cross-window sync
│   │   └── transitions/
│   └── public/
│       └── slides/                # Static assets per slide
│           └── {slide-id}/        # Images, videos, GIFs
├── backend/               # Express API server
└── scripts/               # Media extraction from PPTX
```

## Extending the Presentation

### Adding a slide

1. Create a new directory under `frontend/src/slides/` with a unique slide ID:

```
frontend/src/slides/my-new-slide/
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

4. Add the slide ID to the appropriate section in `frontend/src/data/presentation.json`:

```json
{
  "id": "my-section",
  "title": "Section Title",
  "slides": ["existing-slide", "my-new-slide"]
}
```

5. If the slide has media assets, place them in `frontend/public/slides/my-new-slide/` and reference them as `/slides/my-new-slide/filename.png` in `content.json`.

### Adding a section

Add a section object to the `sections` array in `presentation.json`:

```json
{
  "id": "new-section",
  "title": "New Section Title",
  "slides": ["slide-id-1", "slide-id-2"]
}
```

Outline slides (`layout: "outline"`) automatically render all sections; set `activeSection` to the current section's `id` to highlight it.

### For progressive-build slides

Use per-step notes files: `notes-0.md`, `notes-1.md`, `notes-2.md`, etc.

### Available layouts

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

### Overriding slides in JS

For dynamic content that can't live in static JSON, use the "Slide overrides" section in `presentation.js`:

```js
import { findSlide } from './presentation.js';

Object.assign(findSlide('title'), {
  subtitle: `Last updated: ${new Date().toLocaleDateString()}`,
});
```

### Adding media

1. Place images, GIFs, or videos in `frontend/public/slides/{slide-id}/`.
2. Reference them in the slide's `content.json` as `/slides/{slide-id}/filename.png`.
