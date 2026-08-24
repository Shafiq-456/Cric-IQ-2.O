from PIL import Image
import numpy as np

# Load the extracted ball image
img = Image.open('/home/z/my-project/upload/cricket-ball-extracted.png').convert('RGBA')
data = np.array(img)

# Find white/light pixels and make them transparent
# White is (255, 255, 255) - we'll use a threshold
r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

# Create mask for near-white pixels (threshold: all channels > 240)
white_mask = (r > 240) & (g > 240) & (b > 240)

# Also handle slightly off-white (anti-aliased edges)
# For pixels near the boundary (some channels high but not all), apply partial transparency
light_mask = (r > 200) & (g > 200) & (b > 200) & ~white_mask
# Blend: the closer to white, the more transparent
avg_light = (r.astype(float) + g.astype(float) + b.astype(float)) / 3.0
blend_factor = np.clip((avg_light - 200) / 55.0, 0, 1)

# Set fully white pixels to fully transparent
data[white_mask, 3] = 0

# Set near-white pixels to partially transparent (smooth edges)
data[light_mask, 3] = (data[light_mask, 3] * (1 - blend_factor[light_mask])).astype(np.uint8)

# Create output image
result = Image.fromarray(data)
result.save('/home/z/my-project/upload/cricket-ball-transparent.png')

# Check result
print(f"Output size: {result.size}")
print(f"Has alpha: {result.mode == 'RGBA'}")

# Count non-transparent pixels
alpha = np.array(result)[:, :, 3]
non_transparent = np.sum(alpha > 0)
total = alpha.size
print(f"Ball pixels: {non_transparent}/{total} ({100*non_transparent/total:.1f}%)")
print("Done!")