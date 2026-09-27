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
 * Near-edge rounded-rectangle lens. Positions and dimensions are CSS pixels;
 * the center stays undistorted, and normals follow straight and curved edges.
 * Reuse `out` when sampling many pixels to avoid per-pixel allocations.
 */
export function getLensOffset(
  x: number, y: number,
  width: number, height: number,
  radius: number, strength: number, thickness: number,
  out = { x: 0, y: 0 },
) {
  out.x = 0;
  out.y = 0;
  if (width <= 0 || height <= 0 || strength <= 0) return out;
  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const r = Math.min(Math.max(0, radius), halfWidth, halfHeight);
  const localX = x - halfWidth;
  const localY = y - halfHeight;
  const qx = Math.abs(localX) - (halfWidth - r);
  const qy = Math.abs(localY) - (halfHeight - r);
  const positiveX = Math.max(qx, 0);
  const positiveY = Math.max(qy, 0);
  const cornerLength = Math.hypot(positiveX, positiveY);
  const signedDistance = cornerLength + Math.min(Math.max(qx, qy), 0) - r;
  if (signedDistance > 0) return out;

  const band = Math.min(44, Math.max(16, Math.min(width, height) * 0.12))
    + thickness * 0.45;
  const proximity = Math.max(0, Math.min(1, 1 + signedDistance / band));
  if (proximity === 0) return out;
  const influence = proximity * proximity * (3 - 2 * proximity);
  const displacement = strength * 0.82 * influence;

  if (cornerLength > 0.0001) {
    out.x = Math.sign(localX) * positiveX / cornerLength * displacement;
    out.y = Math.sign(localY) * positiveY / cornerLength * displacement;
  } else if (qx > qy) {
    out.x = Math.sign(localX) * displacement;
  } else {
    out.y = Math.sign(localY) * displacement;
  }
  return out;
}
