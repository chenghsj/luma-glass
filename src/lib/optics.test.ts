import { describe, expect, it } from "vitest";
import { clamp, getCoverLayout, lensOverlayAlpha } from "./optics";

describe("getCoverLayout", () => {
  it("crops wide images horizontally to match background-size cover", () => {
    expect(getCoverLayout(200, 200, 400, 200)).toEqual({
      displayWidth: 400,
      displayHeight: 200,
      cropX: 100,
      cropY: 0,
    });
  });

  it("crops tall images vertically", () => {
    expect(getCoverLayout(200, 100, 100, 200)).toEqual({
      displayWidth: 200,
      displayHeight: 400,
      cropX: 0,
      cropY: 150,
    });
  });

  it("rejects invalid dimensions", () => {
    expect(() => getCoverLayout(0, 100, 100, 100)).toThrow(RangeError);
  });
});

describe("clamp", () => {
  it("keeps props within their supported bounds", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(42, 0, 60)).toBe(42);
    expect(clamp(100, 0, 60)).toBe(60);
    expect(clamp(Number.NaN, 0.5, 6)).toBe(0.5);
  });
});

describe("lensOverlayAlpha", () => {
  it("does not cover the background when refraction is zero", () => {
    expect(lensOverlayAlpha(0, 0, 1.8)).toBe(0);
  });

  it("fades in instead of abruptly replacing the scene at strength one", () => {
    const alpha = lensOverlayAlpha(1, 0, 1.8);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(0.1);
  });

  it("preserves the sharp original image in the glass center", () => {
    expect(lensOverlayAlpha(60, 140, 1.8)).toBe(0);
    expect(lensOverlayAlpha(23, 0, 1.8)).toBe(1);
  });

  it("smoothly feathers the refracted band", () => {
    const near = lensOverlayAlpha(23, 16, 1.8);
    const far = lensOverlayAlpha(23, 65, 1.8);
    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThan(0);
  });
});
