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

- **Arrow keys / Space**: Next/previous slide
- **Click**: Advance slide
- **O**: Toggle slide overview
- **Escape**: Close overview
- **Swipe**: Mobile touch navigation

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
├── frontend/          # Vite + React presentation app
│   ├── src/
│   │   ├── data/      # Slide content (presentation.js)
│   │   ├── components/# React components
│   │   ├── hooks/     # Navigation state, keyboard, swipe
│   │   └── transitions/
│   └── public/media/  # Images, videos, GIFs from PPTX
├── backend/           # Express API server
└── scripts/           # Media extraction from PPTX
```

## Adding Slides

Edit `frontend/src/data/presentation.js`:
- Add a slide object to any section's `slides` array
- Add a new section object to the `sections` array
- Each slide needs an `id` and `layout` (title, content, progressiveBuild, outline, discussion, diagram, media, colabLink)
