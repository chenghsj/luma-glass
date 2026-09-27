/* Standalone GitHub Pages worker, compiled from src/lib/*.ts. */
(() => {
  "use strict";
  const modules = Object.create(null);
  modules["src/lib/displacement.worker.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { getMapDimensions, paintDisplacementMap } = require("./displacement");
const workerScope = self;
workerScope.onmessage = async ({ data: { id, params } }) => {
  try {
    const { width, height } = getMapDimensions(
      params.width, params.height, params.devicePixelRatio
    );
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context || typeof canvas.convertToBlob !== "function") {
      throw new Error("OffscreenCanvas PNG encoding is unavailable");
    }
    const frame = paintDisplacementMap(context, params);
    if (!frame) {
      workerScope.postMessage({ id, result: null });
      return;
    }
    const blob = await canvas.convertToBlob({ type: "image/png" });
    workerScope.postMessage({ id, result: { ...frame, blob } });
  } catch (error) {
    workerScope.postMessage({
      id,
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
  };


  modules["src/lib/displacement.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisplacementMap = createDisplacementMap;
exports.paintDisplacementMap = paintDisplacementMap;
exports.getMapDimensions = getMapDimensions;
exports.getDisplacementScale = getDisplacementScale;
const { clamp, getLensOffset } = require("./optics");
function getMapDimensions(width, height, devicePixelRatio = 1) {
  const dpr = Number.isFinite(devicePixelRatio) ? Math.max(1, devicePixelRatio) : 1;
  const resolution = Math.min(1.5, dpr, Math.sqrt(750000 / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * resolution)),
    height: Math.max(1, Math.floor(height * resolution))
  };
}
function getDisplacementScale(refraction) {
  return Math.max(2, Math.ceil(clamp(refraction, 0, 60) * 0.82 * 2.1));
}
function paintDisplacementMap(context, { width, height, radius, refraction, thickness, devicePixelRatio }) {
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
  return { width, height, scale };
}
function createDisplacementMap(width, height, radius, refraction, thickness,
  devicePixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio) {
  if (!Number.isFinite(width) || !Number.isFinite(height) ||
      width <= 0 || height <= 0 || refraction <= 0) return null;
  const dims = getMapDimensions(width, height, devicePixelRatio);
  const canvas = document.createElement("canvas");
  canvas.width = dims.width;
  canvas.height = dims.height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const frame = paintDisplacementMap(context, {
    width, height, radius, refraction, thickness, devicePixelRatio
  });
  return frame ? { url: canvas.toDataURL("image/png"), ...frame } : null;
}
  };

  modules["src/lib/optics.ts"] = function(require, module, exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
exports.getLensOffset = getLensOffset;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
function getLensOffset(
  x, y,
  width, height,
  radius, strength, thickness,
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

  };

  const cache = Object.create(null);
  function load(id) {
    if (cache[id]) return cache[id].exports;
    const factory = modules[id];
    if (!factory) throw new Error("Missing worker module: " + id);
    const module = { exports: {} };
    cache[id] = module;
    const require = (specifier) => {
      if (!specifier.startsWith(".")) throw new Error("Unexpected worker import: " + specifier);
      const parts = id.split("/");
      parts.pop();
      for (const part of specifier.split("/")) {
        if (part === "..") parts.pop();
        else if (part !== "." && part) parts.push(part);
      }
      const base = parts.join("/");
      const resolved = [base, base + ".ts", base + ".tsx", base + ".js"]
        .find((candidate) => modules[candidate]);
      if (!resolved) throw new Error("Cannot resolve worker import: " + specifier);
      return load(resolved);
    };
    factory(require, module, module.exports);
    return module.exports;
  }
  load("src/lib/displacement.worker.ts");
})();
