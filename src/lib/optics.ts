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
 * Blend only the optically displaced edge over the original scene. This
 * prevents a low-resolution texture from replacing sharp SVG/DOM text in
 * the glass center when strength changes from 0 to 1.
 *
 * Keep this function in sync with the WebGL fragment shader and docs demo.
 */
export function lensOverlayAlpha(
  strength: number,
  edgeDistance: number,
  thickness: number,
): number {
  if (strength <= 0) return 0;
  const strengthFade = clamp(strength / 6, 0, 1);
  const strengthOpacity = strengthFade * strengthFade * (3 - 2 * strengthFade);
  const bandEnd = Math.min(105, 62 + strength * 0.48 + thickness * 2);
  const edgeFade = clamp((edgeDistance - 10) / (bandEnd - 10), 0, 1);
  const edgeOpacity = 1 - edgeFade * edgeFade * (3 - 2 * edgeFade);
  return edgeOpacity * strengthOpacity;
}
