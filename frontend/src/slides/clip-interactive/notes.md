## CLIP Embedding Space Demo

- Click different points to show how CLIP maps related concepts near each other
- **Key demo path**: Click the cat image (●) — show how "A photo of a cat" (◆) is its nearest neighbor
- Then click a text point like "A red sports car" — show how the car image is nearby
- Point out that images (circles) and text (diamonds) of the same concept are close together
- This is how diffusion models understand prompts: the text prompt is encoded by CLIP into this space, and the model generates an image that maps to a nearby point
- The similarity score (right panel) represents cosine similarity in the original high-dimensional CLIP space
