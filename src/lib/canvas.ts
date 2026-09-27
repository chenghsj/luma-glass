import { getCoverLayout, getLensOffset } from "./optics";
import type { RefractionFrame, RefractionRenderer } from "./webgl";

/**
 * Reliable non-WebGL refraction for an image-backed GlassScene.
 * The CSS optical shell and the outer silhouette remain unchanged.
 */
export function createCanvasRefractionRenderer(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
): RefractionRenderer {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas 2D is unavailable.");
  const source = document.createElement("canvas");
  const sourceContext = source.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("Image sampling is unavailable.");

  let cachedWidth = 0;
  let cachedHeight = 0;
  let pixels: Uint8ClampedArray | null = null;

  return {
    draw({ scene, glass, strength, thickness, radius }: RefractionFrame) {
      if (!scene.width || !scene.height || !glass.width || !glass.height) return;
      if (strength <= 0) {
        canvas.style.opacity = "0";
        return;
      }
      // One image sample per CSS pixel: no GPU context and bounded CPU work.
      const sourceWidth = Math.max(1, Math.round(scene.width));
      const sourceHeight = Math.max(1, Math.round(scene.height));
      if (sourceWidth !== cachedWidth || sourceHeight !== cachedHeight) {
        source.width = sourceWidth;
        source.height = sourceHeight;
        const cover = getCoverLayout(
          sourceWidth, sourceHeight, image.naturalWidth, image.naturalHeight,
        );
        sourceContext.clearRect(0, 0, sourceWidth, sourceHeight);
        sourceContext.drawImage(
          image, -cover.cropX, -cover.cropY, cover.displayWidth, cover.displayHeight,
        );
        // The image must be same-origin or CORS-enabled for pixel readback.
        pixels = sourceContext.getImageData(
          0, 0, sourceWidth, sourceHeight,
        ).data;
        cachedWidth = sourceWidth;
        cachedHeight = sourceHeight;
      }
      if (!pixels) return;
      const width = Math.max(1, Math.round(glass.width));
      const height = Math.max(1, Math.round(glass.height));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const result = context.createImageData(width, height);
      const destination = result.data;
      const originX = glass.left - scene.left;
      const originY = glass.top - scene.top;
      const offset = { x: 0, y: 0 };

      for (let y = 0; y < height; y++) {
        const v = (y + 0.5) / height;
        for (let x = 0; x < width; x++) {
          const u = (x + 0.5) / width;
          getLensOffset(
            u * glass.width, v * glass.height,
            glass.width, glass.height, radius, strength, thickness, offset,
          );
          const sx = Math.min(sourceWidth - 1, Math.max(0, Math.round(
            (originX + u * glass.width + offset.x) * sourceWidth / scene.width,
          )));
          const sy = Math.min(sourceHeight - 1, Math.max(0, Math.round(
            (originY + v * glass.height + offset.y) * sourceHeight / scene.height,
          )));
          const from = (sy * sourceWidth + sx) * 4;
          const to = (y * width + x) * 4;
          destination[to] = pixels[from];
          destination[to + 1] = pixels[from + 1];
          destination[to + 2] = pixels[from + 2];
          destination[to + 3] = pixels[from + 3];
        }
      }
      context.putImageData(result, 0, 0);
      canvas.style.opacity = "1";
    },
    dispose() {
      canvas.style.opacity = "0";
    },
  };
}
