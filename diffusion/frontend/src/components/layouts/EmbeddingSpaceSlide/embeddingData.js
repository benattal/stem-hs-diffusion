// Image/text pairs mapped to positions in a 2D embedding space.
// Coordinates are normalized to [0, 1]. Each entry has an image and a caption.
// The positions simulate a t-SNE/UMAP projection of real CLIP embeddings —
// semantically similar concepts are placed near each other.

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const embeddingPairs = [
  // Animals region (upper-right)
  { id: 'cat', caption: 'A photo of a cat', x: 0.78, y: 0.20, image: `${base}/slides/clip-model/image19.jpeg` },
  { id: 'dog', caption: 'A photo of a dog', x: 0.72, y: 0.28, image: `${base}/slides/clip-model/image20.jpeg` },
  { id: 'kitten', caption: 'A cute kitten playing', x: 0.82, y: 0.25, image: `${base}/slides/clip-interactive/kitten.jpg` },
  { id: 'puppy', caption: 'A playful puppy', x: 0.70, y: 0.33, image: `${base}/slides/clip-interactive/puppy.jpg` },

  // Vehicles region (lower-left)
  { id: 'car', caption: 'A red sports car', x: 0.18, y: 0.72, image: `${base}/slides/clip-interactive/car.jpg` },
  { id: 'airplane', caption: 'An airplane in the sky', x: 0.22, y: 0.62, image: `${base}/slides/clip-interactive/airplane.jpg` },
  { id: 'bicycle', caption: 'A bicycle on a country road', x: 0.14, y: 0.68, image: `${base}/slides/clip-interactive/bicycle.jpg` },

  // Nature region (upper-left)
  { id: 'mountain', caption: 'A snowy mountain landscape', x: 0.20, y: 0.20, image: `${base}/slides/clip-interactive/mountain.jpg` },
  { id: 'ocean', caption: 'The ocean at sunset', x: 0.15, y: 0.30, image: `${base}/slides/clip-interactive/ocean.jpg` },
  { id: 'forest', caption: 'A dense green forest', x: 0.25, y: 0.15, image: `${base}/slides/clip-interactive/forest.jpg` },
  { id: 'flower', caption: 'A bright sunflower', x: 0.28, y: 0.28, image: `${base}/slides/clip-interactive/sunflower.jpg` },

  // Food region (lower-right)
  { id: 'pizza', caption: 'A delicious pepperoni pizza', x: 0.75, y: 0.73, image: `${base}/slides/clip-interactive/pizza.jpg` },
  { id: 'cake', caption: 'A chocolate birthday cake', x: 0.70, y: 0.78, image: `${base}/slides/clip-interactive/cake.jpg` },
  { id: 'sushi', caption: 'A plate of fresh sushi', x: 0.82, y: 0.76, image: `${base}/slides/clip-interactive/sushi.jpg` },

  // Space / people (center)
  { id: 'astronaut', caption: 'An astronaut on the Moon', x: 0.48, y: 0.45, image: `${base}/slides/clip-interactive/astronaut.jpg` },
  { id: 'artist', caption: 'An artist painting on canvas', x: 0.45, y: 0.55, image: `${base}/slides/clip-interactive/artist.jpg` },
];

// Color palette — each point gets a consistent hue
const POINT_COLORS = [
  '#6c63ff', '#00d2ff', '#ff6b6b', '#ffd93d', '#6bcb77',
  '#a66cff', '#ff922b', '#20c997', '#f06595', '#339af0',
  '#5c940d', '#e8590c', '#845ef7', '#0ca678', '#e64980',
  '#1c7ed6', '#f76707',
];

export function getColorForPair(pair) {
  const idx = embeddingPairs.indexOf(pair);
  return POINT_COLORS[idx % POINT_COLORS.length];
}

// Find the nearest pair to an arbitrary (x, y) point
export function findNearest(x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const pair of embeddingPairs) {
    const d = (pair.x - x) ** 2 + (pair.y - y) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = pair;
    }
  }
  return best;
}
