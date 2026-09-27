import { describe, expect, it } from "vitest";
import { clamp, getLensOffset } from "./optics";

describe("clamp", () => {
  it("keeps props within their supported bounds", () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(42, 0, 60)).toBe(42);
    expect(clamp(100, 0, 60)).toBe(60);
    expect(clamp(Number.NaN, 0.5, 6)).toBe(0.5);
  });
});

describe("rounded-rectangle lens", () => {
  it("does not warp the center, including at high strength", () => {
    expect(getLensOffset(200, 120, 400, 240, 40, 60, 0.5)).toEqual({ x: 0, y: 0 });
  });

  it("displaces pixels along the nearest straight-edge normal", () => {
    const top = getLensOffset(200, 2, 400, 240, 40, 23, 0.5);
    const right = getLensOffset(398, 120, 400, 240, 40, 23, 0.5);
    expect(top.x).toBe(0);
    expect(top.y).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(0);
    expect(right.y).toBe(0);
  });

  it("follows the rounded corner normal and fades out inside the glass", () => {
    const corner = getLensOffset(376, 16, 400, 240, 40, 23, 0.5);
    const inner = getLensOffset(200, 65, 400, 240, 40, 23, 0.5);
    expect(corner.x).toBeGreaterThan(0);
    expect(corner.y).toBeLessThan(0);
    expect(inner).toEqual({ x: 0, y: 0 });
  });

  it("switches off cleanly at zero refraction", () => {
    expect(getLensOffset(200, 2, 400, 240, 40, 0, 0.5)).toEqual({ x: 0, y: 0 });
  });
});
