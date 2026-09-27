import { afterEach, describe, expect, it, vi } from "vitest";
import type { DisplacementParams } from "./displacement";

const params: DisplacementParams = {
  width: 24,
  height: 16,
  radius: 6,
  refraction: 23,
  thickness: 0.5,
  devicePixelRatio: 2,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("displacement worker client", () => {
  it("lazily shares one worker and revokes its blob URLs", async () => {
    let constructed = 0;
    const posted: number[] = [];
    class FakeWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      onmessageerror: ((event: MessageEvent) => void) | null = null;
      constructor(_url: URL, _options: WorkerOptions) { constructed += 1; }
      postMessage(message: { id: number; params: DisplacementParams }) {
        posted.push(message.id);
        queueMicrotask(() => this.onmessage?.({
          data: {
            id: message.id,
            result: {
              width: message.params.width,
              height: message.params.height,
              scale: 40,
              blob: new Blob(["png"], { type: "image/png" }),
            },
          },
        } as MessageEvent));
      }
      terminate() {}
    }
    vi.stubGlobal("Worker", FakeWorker);
    vi.stubGlobal("OffscreenCanvas", class {});
    const createUrl = vi.spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:glass-one").mockReturnValueOnce("blob:glass-two");
    const revoke = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    const { generateDisplacementMap, releaseDisplacementMap } = await import("./worker-client");
    const [first, second] = await Promise.all([
      generateDisplacementMap(params),
      generateDisplacementMap(params),
    ]);

    expect(constructed).toBe(1);
    expect(posted).toHaveLength(2);
    expect(first?.url).toBe("blob:glass-one");
    expect(second?.url).toBe("blob:glass-two");
    expect(first?.objectUrl).toBe(true);
    expect(createUrl).toHaveBeenCalledTimes(2);
    releaseDisplacementMap(first);
    releaseDisplacementMap(second);
    expect(revoke).toHaveBeenCalledWith("blob:glass-one");
    expect(revoke).toHaveBeenCalledWith("blob:glass-two");
  });

  it("falls back to the main thread when the worker fails", async () => {
    class FailingWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      onmessageerror: ((event: MessageEvent) => void) | null = null;
      constructor(_url: URL, _options: WorkerOptions) {}
      postMessage(message: { id: number }) {
        queueMicrotask(() => this.onmessage?.({
          data: { id: message.id, error: "OffscreenCanvas unavailable" },
        } as MessageEvent));
      }
      terminate() {}
    }
    vi.stubGlobal("Worker", FailingWorker);
    vi.stubGlobal("OffscreenCanvas", class {});
    vi.stubGlobal("document", {
      createElement: () => ({
        getContext: () => ({
          createImageData: (width: number, height: number) => ({
            data: new Uint8ClampedArray(width * height * 4),
          }),
          putImageData: () => {},
        }),
        toDataURL: () => "data:image/png;base64,fallback",
      }),
    });

    const { generateDisplacementMap } = await import("./worker-client");
    const result = await generateDisplacementMap(params);
    expect(result?.url).toBe("data:image/png;base64,fallback");
    expect(result?.objectUrl).toBeUndefined();
    expect(result?.scale).toBe(40);
  });
});
