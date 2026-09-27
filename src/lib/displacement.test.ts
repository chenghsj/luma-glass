import { describe, expect, it } from "vitest";
import { createDisplacementMap, getDisplacementScale, getMapDimensions } from "./displacement";

describe("displacement map sampling", () => {
  it("adds bounded HiDPI detail without changing the CSS-space image dimensions", () => {
    expect(getMapDimensions(480, 300, 1)).toEqual({ width: 480, height: 300 });
    expect(getMapDimensions(480, 300, 2)).toEqual({ width: 720, height: 450 });
    const large = getMapDimensions(1000, 1000, 2);
    expect(large.width * large.height).toBeLessThanOrEqual(750_000);
  });

  it("uses a smaller quantization step at the default strength without clipping at maximum", () => {
    expect(getDisplacementScale(23)).toBe(40);
    expect(getDisplacementScale(60)).toBe(104);
    expect(getDisplacementScale(23) / 255).toBeLessThan(0.2);
    expect(getDisplacementScale(60) / 2).toBeGreaterThan(60 * 0.82);
  });

  it("does not allocate a map when there is no optical displacement", () => {
    expect(createDisplacementMap(480, 300, 40, 0, 0.5)).toBeNull();
  });
});
