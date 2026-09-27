import { clamp, getLensOffset } from "./optics";

export interface DisplacementMap {
  url: string;
  width: number;
  height: number;
  scale: number;
  /** Blob URLs returned by the worker must be revoked after use. */
  objectUrl?: true;
}

export interface DisplacementParams {
  width: number;
  height: number;
  radius: number;
  refraction: number;
  thickness: number;
  devicePixelRatio: number;
}

type PixelContext = Pick<CanvasRenderingContext2D, "createImageData" | "putImageData">;

/** Keep the HiDPI map below 750K pixels, even on high-DPR screens. */
export function getMapDimensions(width: number, height: number, devicePixelRatio = 1) {
  const dpr = Number.isFinite(devicePixelRatio) ? Math.max(1, devicePixelRatio) : 1;
  const resolution = Math.min(1.5, dpr, Math.sqrt(750_000 / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * resolution)),
    height: Math.max(1, Math.floor(height * resolution)),
  };
}

export function getDisplacementScale(refraction: number) {
  return Math.max(2, Math.ceil(clamp(refraction, 0, 60) * 0.82 * 2.1));
}

/** Shared by OffscreenCanvas in the worker and the main-thread fallback. */
export function paintDisplacementMap(
  context: PixelContext,
  { width, height, radius, refraction, thickness, devicePixelRatio }: DisplacementParams,
) {
  if (!Number.isFinite(width) || !Number.isFinite(height) ||
      width <= 0 || height <= 0 || refraction <= 0) return null;

  const { width: mapWidth, height: mapHeight } = getMapDimensions(width, height, devicePixelRatio);
  const image = context.createImageData(mapWidth, mapHeight);
  const pixels = image.data;
  const offset = { x: 0, y: 0 };
  const strength = clamp(refraction, 0, 60);
  const scale = getDisplacementScale(strength);
  const edgeThickness = clamp(thickness, 0.5, 6);

  for (let y = 0; y < mapHeight; y += 1) {
    const sourceY = (y + 0.5) * height / mapHeight;
    for (let x = 0; x < mapWidth; x += 1) {
      const sourceX = (x + 0.5) * width / mapWidth;
      getLensOffset(sourceX, sourceY, width, height, radius, strength, edgeThickness, offset);
      const index = (y * mapWidth + x) * 4;
      pixels[index] = clamp(Math.round(127.5 + offset.x * 255 / scale), 0, 255);
      pixels[index + 1] = clamp(Math.round(127.5 + offset.y * 255 / scale), 0, 255);
      pixels[index + 2] = 128;
      pixels[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  // SVG feImage measures the map in CSS pixels, regardless of bitmap DPR.
  return { width, height, scale };
}

/** Used only when OffscreenCanvas/Worker is unavailable or fails. */
export function createDisplacementMap(
  width: number,
  height: number,
  radius: number,
  refraction: number,
  thickness: number,
  devicePixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio,
): DisplacementMap | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) ||
      width <= 0 || height <= 0 || refraction <= 0) return null;

  const dims = getMapDimensions(width, height, devicePixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = dims.width;
  canvas.height = dims.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const frame = paintDisplacementMap(context, {
    width, height, radius, refraction, thickness, devicePixelRatio,
  });
  return frame ? { url: canvas.toDataURL("image/png"), ...frame } : null;
}
