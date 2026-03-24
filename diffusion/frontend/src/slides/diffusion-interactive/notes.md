## Forward Diffusion Process

- Let the audience play with the slider themselves if possible
- The forward process gradually adds Gaussian noise to the image
- At t=0 we have the clean image; at t=T we have pure noise
- The noise schedule follows a cosine schedule (Nichol & Dhariwal, 2021)
- **Key insight**: Diffusion models learn to *reverse* this process — given a noisy image, predict and remove the noise
- Click "Play" to animate the full forward process over 3 seconds
- Notice how the image structure disappears gradually, not all at once — this is why the model can learn to reverse it step by step
