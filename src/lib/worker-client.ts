import {
  createDisplacementMap,
  type DisplacementMap,
  type DisplacementParams,
} from "./displacement";

interface WorkerResult {
  width: number;
  height: number;
  scale: number;
  blob: Blob;
}

interface WorkerResponse {
  id: number;
  result?: WorkerResult | null;
  error?: string;
}

let sharedWorker: Worker | null = null;
let workerUnavailable = false;
let nextRequestId = 0;
const pending = new Map<number, {
  resolve: (value: WorkerResult | null) => void;
  reject: (reason: Error) => void;
}>();

function disableWorker(error: Error) {
  workerUnavailable = true;
  sharedWorker?.terminate();
  sharedWorker = null;
  for (const request of pending.values()) request.reject(error);
  pending.clear();
}

function getWorker(): Worker | null {
  if (workerUnavailable ||
      typeof Worker === "undefined" ||
      typeof OffscreenCanvas === "undefined" ||
      typeof URL.createObjectURL !== "function") return null;
  if (sharedWorker) return sharedWorker;

  try {
    // Vite bundles this worker as an asset for npm and production Pages builds.
    const worker = new Worker(new URL("./displacement.worker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      const request = pending.get(data.id);
      if (!request) return;
      pending.delete(data.id);
      if (data.error) {
        const error = new Error(data.error);
        request.reject(error);
        disableWorker(error);
      } else {
        request.resolve(data.result ?? null);
      }
    };
    worker.onerror = () => disableWorker(new Error("Displacement worker failed"));
    worker.onmessageerror = () => disableWorker(new Error("Displacement worker message failed"));
    sharedWorker = worker;
    return worker;
  } catch {
    workerUnavailable = true;
    return null;
  }
}

/** One shared, lazily created worker for every LiquidGlass instance. */
export async function generateDisplacementMap(
  params: DisplacementParams,
): Promise<DisplacementMap | null> {
  if (params.width <= 0 || params.height <= 0 || params.refraction <= 0) return null;
  const fallback = () => createDisplacementMap(
    params.width, params.height, params.radius, params.refraction,
    params.thickness, params.devicePixelRatio,
  );
  const worker = getWorker();
  if (!worker) return fallback();

  try {
    const result = await new Promise<WorkerResult | null>((resolve, reject) => {
      const id = ++nextRequestId;
      pending.set(id, { resolve, reject });
      try {
        worker.postMessage({ id, params });
      } catch (error) {
        pending.delete(id);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
    if (!result) return null;
    return {
      url: URL.createObjectURL(result.blob),
      width: result.width,
      height: result.height,
      scale: result.scale,
      objectUrl: true,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[luma-glass] Worker unavailable; generating map on main thread:", error);
    }
    return fallback();
  }
}

export function releaseDisplacementMap(map: DisplacementMap | null) {
  if (map?.objectUrl) URL.revokeObjectURL(map.url);
}
