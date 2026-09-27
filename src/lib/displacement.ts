import { clamp, getLensOffset } from "./optics";

export interface DisplacementMap {
  url: string;
  width: number;
  height: number;
}

/**
 * Encode the same rounded-rectangle edge normals as the former image renderer.
 * Canvas generates only a displacement texture; it never reads page/DOM pixels.
 */
export function createDisplacementMap(
  width: number,
  height: number,
  radius: number,
  refraction: number,
  thickness: number,
): DisplacementMap | null {
  if (width <= 0 || height <= 0 || refraction <= 0) return null;

  const resolution = Math.min(1, Math.sqrt(750_000 / (width * height)));
  const mapWidth = Math.max(1, Math.ceil(width * resolution));
  const mapHeight = Math.max(1, Math.ceil(height * resolution));
  const canvas = document.createElement("canvas");
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const image = context.createImageData(mapWidth, mapHeight);
  const pixels = image.data;
  const offset = { x: 0, y: 0 };
  const strength = clamp(refraction, 0, 60);
  const edgeThickness = clamp(thickness, 0.5, 6);

  for (let y = 0; y < mapHeight; y += 1) {
    const sourceY = (y + 0.5) * height / mapHeight;
    for (let x = 0; x < mapWidth; x += 1) {
      const sourceX = (x + 0.5) * width / mapWidth;
      getLensOffset(sourceX, sourceY, width, height, radius, strength, edgeThickness, offset);
      const index = (y * mapWidth + x) * 4;
      // feDisplacementMap: (channel / 255 - 0.5) * scale. Scale is 128 CSS px.
      pixels[index] = clamp(Math.round(127.5 + offset.x * 255 / 128), 0, 255);
      pixels[index + 1] = clamp(Math.round(127.5 + offset.y * 255 / 128), 0, 255);
      pixels[index + 2] = 128;
      pixels[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return { url: canvas.toDataURL("image/png"), width, height };
}
