/** Match CSS background-size: cover; returned crop coordinates are in CSS pixels. */
export function getCoverLayout(
  sceneWidth: number,
  sceneHeight: number,
  imageWidth: number,
  imageHeight: number,
) {
  if (
    sceneWidth <= 0 ||
    sceneHeight <= 0 ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    throw new RangeError("Scene and image dimensions must be positive.");
  }

  const scale = Math.max(sceneWidth / imageWidth, sceneHeight / imageHeight);
  const displayWidth = imageWidth * scale;
  const displayHeight = imageHeight * scale;

  return {
    displayWidth,
    displayHeight,
    cropX: (displayWidth - sceneWidth) / 2,
    cropY: (displayHeight - sceneHeight) / 2,
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

/**
 * Anchor refraction to the unchanged glass silhouette so lines crossing the
 * glass boundary (such as the Lower Layer card border) remain connected.
 * The taper only modifies displacement; it does not blend two image copies.
 */
export function edgeContinuityFactor(
  strength: number,
  edgeDistance: number,
): number {
  if (strength <= 0) return 0;
  const width = Math.max(24, strength * 1.75);
  const t = clamp(edgeDistance / width, 0, 1);
  return t * t * (3 - 2 * t);
}
