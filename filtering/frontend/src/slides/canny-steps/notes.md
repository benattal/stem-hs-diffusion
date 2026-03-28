Canny edge detection is just Sobel with a few extra steps. 

Build through: 
Original → Grayscale (edges are about brightness, not color) 

→ blur (reduces noise; important because Sobel is sensitive to noise) 

→ calculate the value of the edge. (shows edge strength, but edges are thick).
