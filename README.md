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
│   │   │   ├── presentation.json  # Slide content (source of truth)
│   │   │   ├── presentation.js    # Loads JSON + JS overrides + helpers
│   │   │   ├── presenterNotes.json # Maps slide IDs → note files
│   │   │   ├── notesLoader.js     # Resolves file refs at build time
│   │   │   └── notes/             # Presenter notes as Markdown files
│   │   ├── components/
│   │   │   ├── Presentation.jsx   # Main presentation view
│   │   │   ├── PresenterView.jsx  # Second-monitor presenter display
│   │   │   ├── SlideRenderer.jsx  # Dispatches slides to layout components
│   │   │   └── layouts/           # One component per slide layout
│   │   ├── hooks/
│   │   │   ├── useSlideState.js   # Core navigation state machine
│   │   │   ├── useKeyboardNavigation.js
│   │   │   ├── useSwipeNavigation.js
│   │   │   ├── useFullscreen.js
│   │   │   └── usePresentationSync.js  # BroadcastChannel cross-window sync
│   │   └── transitions/
│   └── public/media/      # Images, videos, GIFs extracted from PPTX
├── backend/               # Express API server
└── scripts/               # Media extraction from PPTX
```

## Extending the Presentation

### Where slides are defined

All slide content is declared in **`frontend/src/data/presentation.json`**. This is the single source of truth for what appears in the presentation — sections, slides, layouts, media references, and all static content.

**`frontend/src/data/presentation.js`** loads the JSON and re-exports it. It also has a clearly marked "Slide overrides" section where you can programmatically patch slides with dynamic or computed values that can't be expressed in static JSON.

### Adding a slide

1. Open `frontend/src/data/presentation.json`.
2. Add a slide object to any section's `slides` array. Every slide needs at least an `id` and a `layout`:

```json
{
  "id": "my-new-slide",
  "layout": "content",
  "sectionLabel": "Section Name",
  "title": "Slide Title",
  "bullets": ["Point one", "Point two"]
}
```

3. Add presenter notes for the slide (see [Editing presenter notes](#editing-presenter-notes) below).

### Adding a section

Add a section object to the `sections` array in `presentation.json`:

```json
{
  "id": "new-section",
  "title": "New Section Title",
  "slides": []
}
```

Outline slides (`layout: "outline"`) automatically render all sections; set `activeSection` to the current section's `id` to highlight it.

### Overriding slides in JS

For dynamic content that can't live in static JSON, use the "Slide overrides" section in `presentation.js`:

```js
import { findSlide } from './presentation.js';

// Override any slide property
Object.assign(findSlide('title'), {
  subtitle: `Last updated: ${new Date().toLocaleDateString()}`,
});
```

### Available layouts

| Layout | Required fields | Description |
|--------|----------------|-------------|
| `title` | `title` | Full-screen title. Optional: `subtitle`, `background` (image path) |
| `outline` | `activeSection` | Section outline with active/completed indicators |
| `content` | `title`, `bullets` | Title + bullet list. Optional: `media` array |
| `progressiveBuild` | `title`, `buildSteps` | Click-to-reveal steps. Each step: `{ label, description, media }` |
| `discussion` | `title`, `prompts` | Grid of discussion prompt strings |
| `diagram` | `title`, `description`, `media` | Explanation + media. Optional: `example` with `positive`/`negative` prompts |
| `media` | `title`, `media` | 2x2 media grid (4 items) |
| `colabLink` | `title`, `description`, `colabUrl` | Colab button + QR code. Optional: `note` |

Media objects are `{ type: "image" | "video" | "gif", src: "/media/images/file.png" }`.

### Editing presenter notes

Notes live as Markdown files in `frontend/src/data/notes/` and are mapped to slides via `frontend/src/data/presenterNotes.json`.

**To edit existing notes:** directly edit the `.md` file in `frontend/src/data/notes/`.

**To add notes for a new slide:** create a Markdown file in `frontend/src/data/notes/` and add an entry to `presenterNotes.json`:

```json
{
  "my-new-slide": { "file": "my-new-slide.md" }
}
```

**For progressive-build slides**, use one file per build step:

```json
{
  "my-build-slide": {
    "buildStepFiles": [
      "my-build-slide-0.md",
      "my-build-slide-1.md",
      "my-build-slide-2.md"
    ]
  }
}
```

**Inline notes** are also supported if you don't want a separate file:

```json
{
  "quick-slide": { "notes": "Brief inline note" },
  "quick-build": { "buildStepNotes": ["Step 1 note", "Step 2 note"] }
}
```

Notes support full Markdown: **bold**, *italics*, lists, `code`, blockquotes, etc.

### Adding media

1. Place images, GIFs, or videos in the appropriate subdirectory under `frontend/public/media/` (`images/`, `gifs/`, or `videos/`).
2. Reference them in slide data as `/media/images/filename.png` (etc.).

To re-extract media from the source PPTX:

```bash
node scripts/extract-pptx-media.js
```
