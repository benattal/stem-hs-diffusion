## From Text and Images to Numbers

So how do we turn text and images into numbers? A special model is trained to take text — like "a photo of a cat" — and convert it into a list of numbers. The same model can also take an actual image and convert it into numbers in the same space.

The key insight: when the text description and the image match, their numbers end up very close together. This is how the system knows what you're asking for when you type a prompt.

**Interactive demo:**
- Hover over different points to show how the model maps related concepts near each other
- **Key demo path**: Hover over the cat area — show how "A photo of a cat" is near the cat image
- Then hover near "A red sports car" — show how the car image is nearby
- Point out that images and text descriptions of the same concept are close together
- This is how diffusion models understand prompts: the text prompt is converted into numbers in this space, and the model generates an image that maps to a nearby point
