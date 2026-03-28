-  another way we can manipulate image values, which should also look familiar to you,
- is that we can increase and decrease the contrast

- to increase the contrast, for every pixel in the image, we can multiply the value of all three color channels by a factor of 2 for example
- as you can see on the left, the image increases in contrast

- to decrease the contrast, we can divide the value of all three color channels 
- as you can see in the middle, the image decreases in contrast

- finally we can also invert the image
- this is by taking the maximum possible color value for a pixel, 255, and subtracting the current color value from it
- in other words, we take the negative image, and we add it to a white image (or an image where every pixel is 255)

- generally when we perform these manipulations, we need to be careful not to exceed the maximum or minimum values for each color channel
- if a channel value goes above 255, it will be capped at 255
- if it goes below 0, it will be capped at 0