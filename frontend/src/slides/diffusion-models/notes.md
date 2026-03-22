Now that we know what noise is, let's see how the diffusion model works:

- It receives two inputs: (1) a noisy image and (2) the numbers from the text-image encoder that describe what we want
- Its job is to predict what the original clean image looks like — basically, to remove the noise
- It does this step by step: remove a little noise, get a slightly cleaner image, remove more noise, and so on
- The numbers from the text encoder guide this process — they tell the model "the final image should look like a cat" or whatever the prompt says
- The video shows this denoising process in action: noise gradually becomes a recognizable image
