import { describe, expect, it } from "vitest";
import { clamp, getCoverLayout } from "./optics";

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
