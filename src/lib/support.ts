/**
 * SVG reference filters in backdrop-filter are currently rendered by Chromium.
 * CSS.supports alone is insufficient: Safari accepts url() but drops the graph.
 * This is an engine-based capability estimate, not a pixel-readback test.
 */
export function supportsBackdropRefraction(userAgent: string, acceptsSvgBackdrop: boolean): boolean {
  if (!acceptsSvgBackdrop) return false;
  if (/(?:iPhone|iPad|iPod|CriOS|EdgiOS|FxiOS)/i.test(userAgent)) return false;
  return /(?:Chrome|Chromium|Edg|OPR|SamsungBrowser)\/\d+/i.test(userAgent);
}

export function isBackdropRefractionSupported(): boolean {
  if (typeof window === "undefined" || typeof CSS === "undefined") return false;
  const supported = CSS.supports("backdrop-filter", "url(#luma-support-probe)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#luma-support-probe)");
  return supportsBackdropRefraction(navigator.userAgent, supported);
}
