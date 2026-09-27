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
