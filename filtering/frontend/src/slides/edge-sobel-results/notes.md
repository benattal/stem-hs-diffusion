* Build through the four steps. 

Original → Sobel-X: subtracts left from right, so vertical edges light up (left and right sides of objects become bright). 

→ Sobel-Y: subtracts top from bottom, so horizontal edges appear instead. 
→ Combined: every edge in the image regardless of orientation. Key insight: we started with blurring and now we're detecting edges — both are just filtering, the only thing that changed was the kernel.
