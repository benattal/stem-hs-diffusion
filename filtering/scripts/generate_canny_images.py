"""Generate intermediate images for Canny edge detection slides."""
import cv2
import numpy as np
import os

INPUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "slides", "blur-filter-designer", "sample.jpg")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "slides", "canny-steps")
os.makedirs(OUTPUT_DIR, exist_ok=True)

img = cv2.imread(INPUT)
assert img is not None, f"Could not read {INPUT}"

# 1. Grayscale
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
cv2.imwrite(os.path.join(OUTPUT_DIR, "1-grayscale.png"), gray)

# 2. Gaussian blur (noise reduction)
blurred = cv2.GaussianBlur(gray, (5, 5), 1.4)
cv2.imwrite(os.path.join(OUTPUT_DIR, "2-gaussian-blur.png"), blurred)

# 3. Sobel gradients
sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)

# Save displayable Sobel images (absolute value, normalized to full range)
sx_abs = np.abs(sobel_x)
sy_abs = np.abs(sobel_y)
cv2.imwrite(os.path.join(OUTPUT_DIR, "3a-sobel-x.png"),
            (sx_abs / sx_abs.max() * 255).astype(np.uint8))
cv2.imwrite(os.path.join(OUTPUT_DIR, "3b-sobel-y.png"),
            (sy_abs / sy_abs.max() * 255).astype(np.uint8))

# 4. Gradient magnitude and direction
magnitude = np.sqrt(sobel_x**2 + sobel_y**2)
direction = np.arctan2(sobel_y, sobel_x) * 180 / np.pi

# Normalize magnitude for display — use CLAHE-like approach for better visibility
mag_norm = (magnitude / magnitude.max() * 255).astype(np.uint8)
# Apply histogram equalization for better contrast
mag_display = cv2.equalizeHist(mag_norm)
cv2.imwrite(os.path.join(OUTPUT_DIR, "4-gradient-magnitude.png"), mag_display)

# Direction as color-coded HSV image with equalized brightness
dir_normalized = ((direction % 180) / 180 * 179).astype(np.uint8)
hsv = np.zeros((*gray.shape, 3), dtype=np.uint8)
hsv[:, :, 0] = dir_normalized
hsv[:, :, 1] = 255
hsv[:, :, 2] = mag_display  # Use equalized magnitude for brightness
dir_color = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
cv2.imwrite(os.path.join(OUTPUT_DIR, "4b-gradient-direction.png"), dir_color)

# 5. Non-maximum suppression (manual implementation)
rows, cols = magnitude.shape
nms = np.zeros_like(magnitude)
angle = direction.copy()
angle[angle < 0] += 180

for i in range(1, rows - 1):
    for j in range(1, cols - 1):
        q, r = 255, 255
        a = angle[i, j]
        if (0 <= a < 22.5) or (157.5 <= a <= 180):
            q = magnitude[i, j + 1]
            r = magnitude[i, j - 1]
        elif 22.5 <= a < 67.5:
            q = magnitude[i + 1, j - 1]
            r = magnitude[i - 1, j + 1]
        elif 67.5 <= a < 112.5:
            q = magnitude[i - 1, j]
            r = magnitude[i + 1, j]
        elif 112.5 <= a < 157.5:
            q = magnitude[i - 1, j - 1]
            r = magnitude[i + 1, j + 1]

        if magnitude[i, j] >= q and magnitude[i, j] >= r:
            nms[i, j] = magnitude[i, j]

# Better NMS display: normalize to full range
nms_norm = (nms / nms.max() * 255).astype(np.uint8)
nms_display = cv2.equalizeHist(nms_norm)
cv2.imwrite(os.path.join(OUTPUT_DIR, "5-non-max-suppression.png"), nms_display)

# 6. Double thresholding
high_threshold = nms.max() * 0.15
low_threshold = high_threshold * 0.4

strong = 255
weak = 75

thresholded = np.zeros_like(nms, dtype=np.uint8)
strong_i, strong_j = np.where(nms >= high_threshold)
weak_i, weak_j = np.where((nms >= low_threshold) & (nms < high_threshold))
thresholded[strong_i, strong_j] = strong
thresholded[weak_i, weak_j] = weak

# Color-coded version: strong=green, weak=yellow, suppressed=black
thresh_color = np.zeros((*gray.shape, 3), dtype=np.uint8)
thresh_color[strong_i, strong_j] = [0, 255, 0]
thresh_color[weak_i, weak_j] = [0, 255, 255]
cv2.imwrite(os.path.join(OUTPUT_DIR, "6-double-threshold.png"), thresh_color)

# 7. Hysteresis edge tracking
final = thresholded.copy()
for i in range(1, rows - 1):
    for j in range(1, cols - 1):
        if final[i, j] == weak:
            neighborhood = final[i-1:i+2, j-1:j+2]
            if np.any(neighborhood == strong):
                final[i, j] = strong
            else:
                final[i, j] = 0

cv2.imwrite(os.path.join(OUTPUT_DIR, "7-hysteresis.png"), final)

# Also save OpenCV's built-in Canny for comparison
opencv_canny = cv2.Canny(gray, 50, 150)
cv2.imwrite(os.path.join(OUTPUT_DIR, "8-opencv-canny.png"), opencv_canny)

# Save original for reference
cv2.imwrite(os.path.join(OUTPUT_DIR, "0-original.png"), img)

print("All Canny intermediate images generated!")
for f in sorted(os.listdir(OUTPUT_DIR)):
    fpath = os.path.join(OUTPUT_DIR, f)
    print(f"  {f} ({os.path.getsize(fpath) // 1024}KB)")
