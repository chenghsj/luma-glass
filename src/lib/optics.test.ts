import { describe, expect, it } from "vitest";
import { clamp, edgeContinuityFactor, getCoverLayout } from "./optics";

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

describe("edge continuity", () => {
  it("has zero displacement exactly at every glass boundary", () => {
    for (const strength of [0, 1, 23, 60]) {
      expect(edgeContinuityFactor(strength, 0)).toBe(0);
      expect(edgeContinuityFactor(strength, -5)).toBe(0);
    }
  });

  it("keeps full continuous refraction away from the boundary", () => {
    for (const strength of [1, 23, 60]) {
      const width = Math.max(24, strength * 1.75);
      expect(edgeContinuityFactor(strength, width)).toBe(1);
      expect(edgeContinuityFactor(strength, width + 20)).toBe(1);
    }
  });

  it("smoothly joins a card border without an abrupt edge jump", () => {
    for (const strength of [1, 23, 60]) {
      const width = Math.max(24, strength * 1.75);
      const first = edgeContinuityFactor(strength, 0);
      const near = edgeContinuityFactor(strength, 0.5);
      const middle = edgeContinuityFactor(strength, width / 2);
      const end = edgeContinuityFactor(strength, width);
      expect(first).toBe(0);
      expect(near).toBeGreaterThan(first);
      expect(near).toBeLessThan(0.002);
      expect(middle).toBeCloseTo(0.5);
      expect(end).toBe(1);
    }
  });
});
