import { getMapDimensions, paintDisplacementMap, type DisplacementParams } from "./displacement";

interface WorkerRequest {
  id: number;
  params: DisplacementParams;
}

// The project targets DOM types; type the worker-only postMessage API locally.
const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

workerScope.onmessage = async ({ data: { id, params } }: MessageEvent<WorkerRequest>) => {
  try {
    const { width, height } = getMapDimensions(
      params.width, params.height, params.devicePixelRatio,
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
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
