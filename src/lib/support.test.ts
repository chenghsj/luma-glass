import { describe, expect, it } from "vitest";
import { supportsBackdropRefraction } from "./support";

describe("SVG backdrop refraction support", () => {
  const chrome = "Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36";
  const safari = "Mozilla/5.0 Version/26.0 Safari/605.1.15";
  const firefox = "Mozilla/5.0 Firefox/140.0";

  it("requires CSS SVG backdrop filter syntax and Chromium", () => {
    expect(supportsBackdropRefraction(chrome, true)).toBe(true);
    expect(supportsBackdropRefraction(chrome, false)).toBe(false);
  });

  it("does not falsely report Safari or Firefox as supported", () => {
    expect(supportsBackdropRefraction(safari, true)).toBe(false);
    expect(supportsBackdropRefraction(firefox, true)).toBe(false);
  });

  it("excludes iOS browsers that use WebKit", () => {
    expect(supportsBackdropRefraction("Mozilla/5.0 (iPhone) CriOS/130.0.0.0", true)).toBe(false);
    expect(supportsBackdropRefraction("Mozilla/5.0 (iPhone) EdgiOS/130.0.0.0", true)).toBe(false);
  });

  it("treats unrecognized engines as unverified instead of claiming support", () => {
    expect(supportsBackdropRefraction("CustomBrowser/1.0", true)).toBe(false);
  });
});
