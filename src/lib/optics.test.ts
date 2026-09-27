import { describe, expect, it } from "vitest";
import { clamp, getCoverLayout, lensBandEnd, lensDisplacementWeight, lensOverlayAlpha } from "./optics";

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

describe("lens edge pixel replacement", () => {
  it("shows the original image at zero refraction", () => {
    expect(lensOverlayAlpha(0, 0, 1.8)).toBe(0);
    expect(lensDisplacementWeight(0, 0, 1.8)).toBe(0);
  });

  it("replaces refracted pixels at full opacity even at strength one", () => {
    expect(lensOverlayAlpha(1, 0, 1.8)).toBe(1);
    expect(lensDisplacementWeight(1, 0, 1.8)).toBe(1);
  });

  it("leaves the sharp original visible at the glass center", () => {
    expect(lensOverlayAlpha(60, 140, 1.8)).toBe(0);
    expect(lensDisplacementWeight(60, 140, 1.8)).toBe(0);
  });

  it("stops displacement before any alpha blending can create ghosting", () => {
    for (const strength of [1, 6, 23, 60]) {
      for (const thickness of [0.5, 1.8, 6]) {
        const end = lensBandEnd(strength, thickness);
        expect(lensDisplacementWeight(strength, end - 3, thickness)).toBe(0);
        expect(lensOverlayAlpha(strength, end - 3, thickness)).toBe(1);
        expect(lensDisplacementWeight(strength, end - 1, thickness)).toBe(0);
        expect(lensOverlayAlpha(strength, end - 1, thickness)).toBeCloseTo(0.5);
        expect(lensOverlayAlpha(strength, end, thickness)).toBe(0);
      }
    }
  });
});
