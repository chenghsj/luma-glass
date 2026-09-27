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
 * Replace the original scene inside the lens band. All displacement reaches
 * zero before the two-pixel transparency seam starts.
 * Keep the WebGL shader, Canvas renderer and static demo in sync.
 */
export function lensBandEnd(strength: number, thickness: number): number {
  return Math.min(105, 62 + strength * 0.48 + thickness * 2);
}

function smoothstep(start: number, end: number, value: number): number {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

export function lensDisplacementWeight(
  strength: number,
  edgeDistance: number,
  thickness: number,
): number {
  if (strength <= 0) return 0;
  const end = lensBandEnd(strength, thickness);
  return 1 - smoothstep(end - 27, end - 3, edgeDistance);
}

export function lensOverlayAlpha(
  strength: number,
  edgeDistance: number,
  thickness: number,
): number {
  if (strength <= 0) return 0;
  const end = lensBandEnd(strength, thickness);
  return 1 - smoothstep(end - 2, end, edgeDistance);
}
